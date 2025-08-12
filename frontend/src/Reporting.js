// frontend/src/Reporting.js
import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const getReportData = httpsCallable(getFunctions(), 'getReportData');

function Reporting() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const result = await getReportData();
                // Corrected JavaScript syntax below
                setReportData(result.data);
            } catch (err) { setError('Failed to fetch report data.'); } 
            finally { setLoading(false); }
        };
        fetchReport();
    }, []);

    if (loading) return <p>Generating report...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!reportData) return <p>No data to display.</p>;

    const allergyChartData = {
        labels: Object.keys(reportData.allergyDistribution),
        datasets: [{
            label: 'Allergy Counts',
            data: Object.values(reportData.allergyDistribution),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }],
    };
    
    const sessionChartData = {
        labels: reportData.sessionEnrollment.map(s => s.sessionName),
        datasets: [{
            label: 'Campers Enrolled',
            data: reportData.sessionEnrollment.map(s => s.enrolledCount),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };
    
    const genderChartData = {
        labels: Object.keys(reportData.genderDistribution),
        datasets: [{
            label: 'Gender Distribution',
            data: Object.values(reportData.genderDistribution),
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        }],
    };

    return (
        <div>
            <h2>Camp Report</h2>
            <p>Generated at: {new Date(reportData.generatedAt).toLocaleString()}</p>
            
            <h3>Total Registered Campers: {reportData.totalCampers}</h3>
            
            <hr />
            
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                <div style={{ width: '45%' }}>
                    <h4>Session Enrollment</h4>
                    <Bar data={sessionChartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Enrollment per Session' }}}} />
                </div>
                <div style={{ width: '40%', maxHeight: '400px' }}>
                    <h4>Gender Distribution</h4>
                    <Pie data={genderChartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Camper Gender Distribution' }}}} />
                </div>
            </div>

            <hr />
            
            <h4>Allergy Distribution</h4>
            <div style={{width: '50%', margin: 'auto'}}>
                <Doughnut data={allergyChartData} />
            </div>

            <hr />

            <h4>Hospital Visit Log</h4>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Hospital</th>
                        <th>Reason</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.hospitalVisitLog.map((visit, index) => (
                        <tr key={index}>
                            <td>{new Date(visit.timestamp.toDate()).toLocaleString()}</td>
                            <td>{visit.hospitalName}</td>
                            <td>{visit.reason}</td>
                            <td>{visit.note}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Reporting;
