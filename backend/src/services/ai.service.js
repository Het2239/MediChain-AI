const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * AI Service for Medical Insights Generation
 * Uses Google Gemini AI to analyze patient medical records
 */

class AIService {
    constructor() {
        // Debug: Check if API key is loaded
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('🔑 Gemini API Key loaded:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No - MISSING!');

        if (!apiKey) {
            console.error('❌ GEMINI_API_KEY is not set in environment variables!');
            throw new Error('GEMINI_API_KEY is required but not found in .env');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash-lite as specified
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite'
        });
        this.visionModel = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite'
        });

        console.log('✅ Gemini AI models initialized successfully (gemini-2.5-flash-lite)');

        // In-memory cache for insights
        this.insightsCache = new Map();
        this.CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Extract text from PDF buffer
     * @param {Buffer} buffer - PDF file buffer
     * @returns {Promise<string>} - Extracted text
     */
    async extractTextFromPDF(buffer) {
        try {
            const data = await pdfParse(buffer);
            return data.text;
        } catch (error) {
            console.error('PDF extraction error:', error);
            return null;
        }
    }

    /**
     * Extract text from DOCX buffer
     * @param {Buffer} buffer - DOCX file buffer
     * @returns {Promise<string>} - Extracted text
     */
    async extractTextFromDocx(buffer) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } catch (error) {
            console.error('DOCX extraction error:', error);
            return null;
        }
    }

    /**
     * Extract text from image using Gemini Vision
     * @param {Buffer} buffer - Image buffer
     * @param {string} mimeType - Image mime type
     * @returns {Promise<string>} - Extracted text
     */
    async extractTextFromImage(buffer, mimeType = 'image/jpeg') {
        try {
            const imageParts = [
                {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType: mimeType
                    }
                }
            ];

            const result = await this.visionModel.generateContent([
                'Extract all text from this medical document image. Include all visible text, numbers, and medical terminology.',
                ...imageParts
            ]);

            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Image extraction error:', error);
            return null;
        }
    }

    /**
     * Extract text from file based on type
     * @param {Buffer} buffer - File buffer
     * @param {string} fileType - File extension (pdf, docx, jpg, png, txt)
     * @param {string} mimeType - File mime type
     * @returns {Promise<string>} - Extracted text
     */
    async extractTextFromFile(buffer, fileType, mimeType = '') {
        try {
            switch (fileType.toLowerCase()) {
                case 'pdf':
                    return await this.extractTextFromPDF(buffer);

                case 'docx':
                case 'doc':
                    return await this.extractTextFromDocx(buffer);

                case 'jpg':
                case 'jpeg':
                case 'png':
                    const imgMime = mimeType || `image/${fileType}`;
                    return await this.extractTextFromImage(buffer, imgMime);

                case 'txt':
                    return buffer.toString('utf-8');

                default:
                    console.warn(`Unsupported file type: ${fileType}`);
                    return null;
            }
        } catch (error) {
            console.error(`Error extracting text from ${fileType}:`, error);
            return null;
        }
    }

    /**
     * Generate medical insights from patient files
     * @param {string} patientAddress - Patient wallet address
     * @param {Array} filesData - Array of {filename, content, category, timestamp, fileType}
     * @returns {Promise<Object>} - Generated insights
     */
    async generateMedicalInsights(patientAddress, filesData) {
        try {
            console.log(`\n🤖 Generating AI insights for ${patientAddress}...`);
            console.log(`📄 Analyzing ${filesData.length} files...`);

            // Check cache first
            const cached = this.getCachedInsights(patientAddress);
            if (cached && cached.fileCount === filesData.length) {
                console.log('✅ Using cached insights');
                return cached.insights;
            }

            // Filter out files without content
            const validFiles = filesData.filter(f => f.content && f.content.trim());

            if (validFiles.length === 0) {
                return this.getEmptyInsights();
            }

            // Build context for Gemini
            const filesContext = validFiles.map((file, index) => `
=== Medical Record ${index + 1} ===
Filename: ${file.filename}
Category: ${file.category}
Date: ${new Date(file.timestamp * 1000).toLocaleDateString()}
File Type: ${file.fileType}

Content:
${file.content}

---
`).join('\n');

            const prompt = `You are an AI medical assistant analyzing patient health records. Analyze these medical documents and provide comprehensive insights.

${filesContext}

Please analyze the above medical records and provide a detailed health assessment in the following JSON format:

{
  "healthSummary": "Brief 2-3 sentence overall health summary",
  "keyFindings": [
    {
      "condition": "Condition name",
      "severity": "Mild/Moderate/Severe",
      "firstMentioned": "Date or 'Unknown'",
      "details": "Brief details"
    }
  ],
  "medications": [
    {
      "name": "Medication name",
      "purpose": "Purpose/indication",
      "dosage": "Dosage if mentioned",
      "frequency": "Frequency if mentioned"
    }
  ],
  "timeline": [
    {
      "date": "Date",
      "event": "Event description",
      "category": "diagnosis/treatment/test/other"
    }
  ],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "riskFactors": [
    {
      "factor": "Risk factor name",
      "level": "Low/Moderate/High",
      "reasoning": "Why this is a risk"
    }
  ],
  "vitalTrends": {
    "bloodPressure": "Trend description if available",
    "heartRate": "Trend description if available",
    "weight": "Trend description if available",
    "other": "Other vital trends"
  }
}

IMPORTANT: 
- Only include information actually present in the records
- If a section has no relevant data, use empty arrays []
- Use "Unknown" or "Not specified" when dates/details are missing
- Be medical professional but also patient-friendly
- Respond ONLY with valid JSON, no other text`;

            // Call Gemini API
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON from response
            let insights;
            try {
                // Extract JSON from markdown code blocks if present
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
                const jsonText = jsonMatch ? jsonMatch[1] : text;
                insights = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                // Fallback: try to extract insights from text
                insights = this.parseInsightsFromText(text);
            }

            // Add metadata
            const result_data = {
                patientAddress,
                generatedAt: new Date().toISOString(),
                filesAnalyzed: validFiles.length,
                insights
            };

            // Cache the insights
            this.cacheInsights(patientAddress, result_data, validFiles.length);

            console.log('✅ Insights generated successfully');
            return result_data;

        } catch (error) {
            console.error('Insight generation error:', error);
            throw new Error(`Failed to generate insights: ${error.message}`);
        }
    }

    /**
     * Parse insights from non-JSON text (fallback)
     */
    parseInsightsFromText(text) {
        return {
            healthSummary: text.substring(0, 200) + '...',
            keyFindings: [],
            medications: [],
            timeline: [],
            recommendations: [],
            riskFactors: [],
            vitalTrends: {}
        };
    }

    /**
     * Generate patient-specific dashboard
     * Focuses on clarity, reassurance, and awareness
     * @param {string} patientAddress - Patient wallet address
     * @param {Array} filesData - Array of medical records with content
     * @returns {Promise<Object>} - Patient dashboard data
     */
    async generatePatientDashboard(patientAddress, filesData) {
        try {
            console.log(`\n🏥 Generating Patient Dashboard for ${patientAddress}...`);

            // Filter valid files and sort by date (most recent first)
            const validFiles = filesData
                .filter(f => f.content && f.content.trim())
                .sort((a, b) => b.timestamp - a.timestamp);

            if (validFiles.length === 0) {
                return this.getEmptyPatientDashboard();
            }

            // Build context
            const filesContext = validFiles.map((file, index) => `
=== Medical Record ${index + 1} ===
Filename: ${file.filename}
Category: ${file.category}
Date: ${new Date(file.timestamp * 1000).toLocaleDateString()}
File Type: ${file.fileType}

Content:
${file.content}

---
`).join('\n');

            const prompt = `You are a medical AI assistant creating a patient-friendly health dashboard. Analyze these medical records and provide insights focused on clarity, reassurance, and awareness (NOT diagnosis).

${filesContext}

Generate a dashboard in the following JSON format:

{
  "healthProgressSummary": {
    "points": [
      "2-3 concise points answering: Is my health improving or worsening compared to the past?",
      "Use simple language, focus on trends not diagnosis"
    ],
    "overallTrend": "Improving | Stable | Needs Attention",
    "citedReports": ["Report name - Date", "Report name - Date"]
  },
  "whatChangedSinceLastTime": {
    "changes": [
      "Specific change with values (e.g., Blood sugar increased from 160 → 180 mg/dL)",
      "New medication appears in latest prescription",
      "Missing updates (e.g., No blood pressure readings updated)"
    ],
    "comparedReports": ["Latest Report - Date", "Previous Report - Date"]
  },
  "longTermTrends": {
    "conditions": [
      {
        "name": "Condition name (e.g., Diabetes)",
        "trend": "increasing | stable | decreasing",
        "confidence": "high | medium | low",
        "description": "Brief explanation"
      }
    ]
  },
  "attentionPoints": {
    "observations": [
      "Pattern or point worth noting (e.g., consistently high values)",
      "Missing recent reports recommendation",
      "Medication change patterns"
    ],
    "references": ["Report 1 - Date", "Report 2 - Date"]
  },
  "recordsSummary": {
    "totalRecords": ${validFiles.length},
    "dateRange": "First to Latest",
    "categories": ["List of categories found"]
  }
}

CRITICAL INSTRUCTIONS:
- Use simple, patient-friendly language (no medical jargon)
- Focus on CHANGE and TRENDS (comparing reports)
- Always cite specific reports with dates
- If only 1 report exists, note "Baseline established, need more data for trends"
- For "whatChangedSinceLastTime", compare the 2 most recent reports
- For "longTermTrends", look across all reports
- Avoid diagnostic language - use observational tone
- Be reassuring but honest

Output ONLY valid JSON, no other text.`;

            // Call Gemini
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON
            let dashboard;
            try {
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
                const jsonText = jsonMatch ? jsonMatch[1] : text;
                dashboard = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                dashboard = this.getEmptyPatientDashboard();
            }

            const resultData = {
                patientAddress,
                generatedAt: new Date().toISOString(),
                filesAnalyzed: validFiles.length,
                dashboardType: 'patient',
                dashboard
            };

            // Cache it
            this.cacheInsights(patientAddress + '_patient', resultData, validFiles.length);

            console.log('✅ Patient dashboard generated successfully');
            return resultData;

        } catch (error) {
            console.error('Patient dashboard generation error:', error);
            throw new Error(`Failed to generate patient dashboard: ${error.message}`);
        }
    }

    /**
     * Get empty insights structure
     */
    getEmptyInsights() {
        return {
            patientAddress: '',
            generatedAt: new Date().toISOString(),
            filesAnalyzed: 0,
            insights: {
                healthSummary: 'No medical records available for analysis.',
                keyFindings: [],
                medications: [],
                timeline: [],
                recommendations: ['Upload medical records to generate insights'],
                riskFactors: [],
                vitalTrends: {}
            }
        };
    }

    /**
     * Get empty patient dashboard structure
     */
    getEmptyPatientDashboard() {
        return {
            patientAddress: '',
            generatedAt: new Date().toISOString(),
            filesAnalyzed: 0,
            dashboardType: 'patient',
            dashboard: {
                healthProgressSummary: {
                    points: ['No medical records available for analysis.'],
                    overallTrend: 'Insufficient Data',
                    citedReports: []
                },
                whatChangedSinceLastTime: {
                    changes: ['Upload medical records to track changes over time'],
                    comparedReports: []
                },
                longTermTrends: {
                    conditions: []
                },
                attentionPoints: {
                    observations: ['Upload medical records to begin tracking your health'],
                    references: []
                },
                recordsSummary: {
                    totalRecords: 0,
                    dateRange: 'No data',
                    categories: []
                }
            }
        };
    }

    /**
     * Generate doctor-specific dashboard
     * Focuses on clinical efficiency and verification
     * @param {string} patientAddress - Patient wallet address
     * @param {Array} filesData - Array of medical records with content
     * @returns {Promise<Object>} - Doctor dashboard data
     */
    async generateDoctorDashboard(patientAddress, filesData) {
        try {
            console.log(`\n👨‍⚕️ Generating Doctor Dashboard for patient ${patientAddress}...`);

            // Filter valid files and sort by date
            const validFiles = filesData
                .filter(f => f.content && f.content.trim())
                .sort((a, b) => b.timestamp - a.timestamp);

            if (validFiles.length === 0) {
                return this.getEmptyDoctorDashboard();
            }

            // Build context
            const filesContext = validFiles.map((file, index) => `
=== Medical Record ${index + 1} ===
Filename: ${file.filename}
Category: ${file.category}
Date: ${new Date(file.timestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
File Type: ${file.fileType}

Content:
${file.content}

---
`).join('\n');

            const prompt = `You are a medical AI assistant creating a clinical dashboard for physicians. Analyze these medical records and provide structured, evidence-based insights for efficient patient review.

${filesContext}

Generate a dashboard in the following JSON format:

{
  "patientOverview": {
    "activeConditions": ["List of chronic conditions detected"],
    "firstRecordDate": "MMM DD, YYYY",
    "latestUpdateDate": "MMM DD, YYYY",
    "recordCount": ${validFiles.length}
  },
  "conditionSummaries": [
    {
      "condition": "Condition name (e.g., Diabetes)",
      "firstDetected": "MMM DD, YYYY",
      "latestReport": "MMM DD, YYYY",
      "trend": "improving | stable | worsening | insufficient_data",
      "keyValues": [
        {"metric": "HbA1c", "value": "8.2%", "status": "High | Normal | Low"}
      ],
      "recentRecords": ["Report Name – MMM DD, YYYY", "Report Name – MMM DD, YYYY"]
    }
  ],
  "changesSinceLastReview": {
    "changes": [
      "Specific quantitative changes (e.g., HbA1c increased from 7.6% → 8.2%)",
      "Medication updates",
      "Missing data points"
    ],
    "comparedReports": ["Latest Report – Date", "Previous Report – Date"]
  },
  "healthSnapshot": {
    "chronicConditionsCount": 0,
    "mostActiveCondition": "Condition name or 'None'",
    "generalStatus": "Stable | Needs Attention | Insufficient Data",
    "dataCoverage": "High | Medium | Low",
    "dataCoverageReason": "Brief explanation"
  }
}

CRITICAL INSTRUCTIONS FOR PHYSICIANS:
- Use clinically precise language with quantitative values
- Always include dates in format "MMM DD, YYYY" (e.g., "Jan 15, 2026")
- Focus on DELTAS (changes between reports)
- Group information by condition
- Cite specific reports with dates for verification
- If only 1 report: note "Baseline established"
- For "changesSinceLastReview": compare 2 most recent reports
- For "conditionSummaries": analyze all reports per condition
- Be objective and evidence-based

Output ONLY valid JSON, no other text.`;

            // Call Gemini
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON
            let dashboard;
            try {
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
                const jsonText = jsonMatch ? jsonMatch[1] : text;
                dashboard = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                dashboard = this.getEmptyDoctorDashboard().dashboard;
            }

            const resultData = {
                patientAddress,
                generatedAt: new Date().toISOString(),
                filesAnalyzed: validFiles.length,
                dashboardType: 'doctor',
                dashboard
            };

            // Cache it
            this.cacheInsights(patientAddress + '_doctor', resultData, validFiles.length);

            console.log('✅ Doctor dashboard generated successfully');
            return resultData;

        } catch (error) {
            console.error('Doctor dashboard generation error:', error);
            throw new Error(`Failed to generate doctor dashboard: ${error.message}`);
        }
    }

    /**
     * Get empty doctor dashboard structure
     */
    getEmptyDoctorDashboard() {
        return {
            patientAddress: '',
            generatedAt: new Date().toISOString(),
            filesAnalyzed: 0,
            dashboardType: 'doctor',
            dashboard: {
                patientOverview: {
                    activeConditions: [],
                    firstRecordDate: 'No data',
                    latestUpdateDate: 'No data',
                    recordCount: 0
                },
                conditionSummaries: [],
                changesSinceLastReview: {
                    changes: ['No medical records available'],
                    comparedReports: []
                },
                healthSnapshot: {
                    chronicConditionsCount: 0,
                    mostActiveCondition: 'None',
                    generalStatus: 'Insufficient Data',
                    dataCoverage: 'Low',
                    dataCoverageReason: 'No medical records uploaded'
                }
            }
        };
    }

    /**
     * Cache insights
     */
    cacheInsights(patientAddress, insights, fileCount) {
        this.insightsCache.set(patientAddress.toLowerCase(), {
            insights,
            fileCount,
            cachedAt: Date.now()
        });
    }

    /**
     * Get cached insights
     */
    getCachedInsights(patientAddress) {
        const cached = this.insightsCache.get(patientAddress.toLowerCase());
        if (!cached) return null;

        // Check expiry
        if (Date.now() - cached.cachedAt > this.CACHE_EXPIRY) {
            this.insightsCache.delete(patientAddress.toLowerCase());
            return null;
        }

        return cached;
    }

    /**
     * Clear cache for patient
     */
    clearCache(patientAddress) {
        this.insightsCache.delete(patientAddress.toLowerCase());
    }

    /**
     * Clear all cache
     */
    clearAllCache() {
        this.insightsCache.clear();
    }
}

// Export class, not singleton - instantiate when needed
module.exports = AIService;
