import React, { useState } from 'react';
import './AdminPortal.css';

// Importing the actual components we have
import SessionManagement from './SessionManagement';
import UserManagement from './UserManagement';
import Reporting from './Reporting';
import CabinManagement from './CabinManagement';
import CabinAssignment from './CabinAssignment';
import Dashboard from './Dashboard';

// Placeholders for components that are not yet built or need to be created
const IncompleteRegistrations = () => <div>Incomplete Registrations Component</div>;
const WaitlistManagement = () => <div>Waitlist Management Component</div>;
const CamperManagement = () => <div>Camper Management Component</div>;
const EmployeeManagement = () => <div>Employee Applications Component</div>;
const EmailPackages = () => <div>Email Packages Component</div>;


const componentMap = {
    Dashboard,
    IncompleteRegistrations,
    WaitlistManagement,
    CabinAssignment, // This is the component for "Housing"
    CamperManagement,
    UserManagement,
    EmployeeManagement,
    SessionManagement,
    CabinManagement,
    EmailPackages,
    Reporting,
};

// Updated navStructure: Assign Campers to Cabins is renamed to Housing
const navStructure = {
    Home: { component: 'Dashboard' },
    Manage: {
        'Registration': { 
            'Incomplete': { component: 'IncompleteRegistrations' },
            'Waitlist': { component: 'WaitlistManagement' },
            'Housing': { component: 'CabinAssignment' }, // Renamed
         },
        'Campers': { component: 'CamperManagement' },
        'Users': { component: 'UserManagement' },
        'Employees': { 
            'Applications': { component: 'EmployeeManagement' }
        },
    },
    Config: {
        'Create Sessions': { component: 'SessionManagement' },
        'Create Cabins': { component: 'CabinManagement' },
        'Email Packages': { component: 'EmailPackages' },
    },
    Reports: {
        'Standard Reports': { component: 'Reporting' },
    }
};

function AdminPortal() {
    const [selectedPrimary, setSelectedPrimary] = useState('Home');
    const [selectedSecondary, setSelectedSecondary] = useState(null);
    const [selectedTertiary, setSelectedTertiary] = useState(null);

    const handlePrimarySelect = (primary) => {
        setSelectedPrimary(primary);
        if (navStructure[primary].component) {
            setSelectedSecondary(null);
            setSelectedTertiary(null);
        } else {
            const secondaryKeys = Object.keys(navStructure[primary]);
            const firstSecondary = secondaryKeys[0];
            setSelectedSecondary(firstSecondary);
            if(typeof navStructure[primary][firstSecondary] === 'object' && !navStructure[primary][firstSecondary].component){
                setSelectedTertiary(Object.keys(navStructure[primary][firstSecondary])[0]);
            } else {
                setSelectedTertiary(null);
            }
        }
    };
    
    const handleSecondarySelect = (secondary) => {
        setSelectedSecondary(secondary);
        if(typeof navStructure[selectedPrimary][secondary] === 'object' && !navStructure[selectedPrimary][secondary].component){
            setSelectedTertiary(Object.keys(navStructure[selectedPrimary][secondary])[0]);
        } else {
            setSelectedTertiary(null);
        }
    };
    
    const handleTertiarySelect = (tertiary) => {
        setSelectedTertiary(tertiary);
    };

    const renderComponent = () => {
        const primaryNav = navStructure[selectedPrimary];
        if (!primaryNav) return null;

        if (primaryNav.component) {
            const Component = componentMap[primaryNav.component];
            return Component ? <Component /> : <div>Component not found.</div>;
        }
        
        const secondaryNav = primaryNav[selectedSecondary];
        if (!secondaryNav) return null;

        let componentName;
        if (secondaryNav.component) {
            componentName = secondaryNav.component;
        } 
        else if (selectedTertiary && secondaryNav[selectedTertiary]) {
             componentName = secondaryNav[selectedTertiary].component;
        } 
        else {
             return <div>Please select an item from the menu.</div>;
        }

        const Component = componentMap[componentName];
        return Component ? <Component /> : <div>Component not found for: {componentName}</div>;
    };
    
    return (
        <div className="admin-portal-container">
            <div className="admin-column">
                <h3>Categories</h3>
                {Object.keys(navStructure).map(key => (
                    <button key={key} onClick={() => handlePrimarySelect(key)} className={selectedPrimary === key ? 'active' : ''}>
                        {key}
                    </button>
                ))}
            </div>

            {selectedPrimary && !navStructure[selectedPrimary].component && (
                 <div className="admin-column">
                    <h3>{selectedPrimary}</h3>
                    {Object.keys(navStructure[selectedPrimary]).map(key => (
                         <button key={key} onClick={() => handleSecondarySelect(key)} className={selectedSecondary === key ? 'active' : ''}>
                            {key}
                        </button>
                    ))}
                </div>
            )}

            {selectedSecondary && navStructure[selectedPrimary]?.[selectedSecondary] && !navStructure[selectedPrimary][selectedSecondary].component && (
                 <div className="admin-column">
                    <h3>{selectedSecondary}</h3>
                    {Object.keys(navStructure[selectedPrimary][selectedSecondary]).map(key => (
                         <button key={key} onClick={() => handleTertiarySelect(key)} className={selectedTertiary === key ? 'active' : ''}>
                            {key}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="admin-content-area">
                {renderComponent()}
            </div>
        </div>
    );
}

export default AdminPortal;
