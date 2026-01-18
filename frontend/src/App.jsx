import { Routes, Route, Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import PatientDashboard from './pages/patient/Dashboard';
import PatientRecords from './pages/patient/Records';
import PatientAccessControl from './pages/patient/AccessControl';
import PatientInsights from './pages/patient/Insights';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPatientRecords from './pages/doctor/PatientRecords';
import DoctorPatientInsights from './pages/doctor/PatientInsights';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
    const { address, isConnected } = useAccount();

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />

                {/* Patient Routes */}
                <Route path="patient">
                    <Route index element={<PatientDashboard />} />
                    <Route path="records" element={<PatientRecords />} />
                    <Route path="access-control" element={<PatientAccessControl />} />
                    <Route path="insights" element={<PatientInsights />} />
                </Route>

                {/* Doctor Routes */}
                <Route path="doctor">
                    <Route index element={<DoctorDashboard />} />
                    <Route path="patients" element={<DoctorPatients />} />
                    <Route path="patient/:patientAddress/records" element={<DoctorPatientRecords />} />
                    <Route path="patient/:patientAddress/insights" element={<DoctorPatientInsights />} />
                </Route>

                {/* Admin Routes */}
                <Route path="admin">
                    <Route index element={<AdminDashboard />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
