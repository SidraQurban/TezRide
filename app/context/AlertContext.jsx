import React, { createContext, useContext, useState, useCallback } from 'react';
import ModernAlert from '../components/ModernAlert';
import ModernToast from '../components/ModernToast';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info', // 'success', 'error', 'info', 'warning'
        onOk: null,
        onCancel: null,
        okText: 'OK',
        cancelText: 'Cancel',
        icon: null,
    });

    const [toastConfig, setToastConfig] = useState({
        visible: false,
        message: '',
        type: 'success', // 'success', 'error', 'info'
    });

    const showAlert = useCallback((config) => {
        setAlertConfig({
            visible: true,
            title: config.title || 'Alert',
            message: config.message || '',
            type: config.type || 'info',
            onOk: config.onOk || null,
            onCancel: config.onCancel || null,
            okText: config.okText || 'OK',
            cancelText: config.cancelText || 'Cancel',
            icon: config.icon || null,
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
    }, []);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        setToastConfig({
            visible: true,
            message,
            type,
        });
        setTimeout(() => {
            setToastConfig((prev) => ({ ...prev, visible: false }));
        }, duration);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert, showToast }}>
            {children}
            <ModernAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onOk={() => {
                    if (alertConfig.onOk) alertConfig.onOk();
                    hideAlert();
                }}
                okText={alertConfig.okText}
                onCancel={() => {
                    if (alertConfig.onCancel) alertConfig.onCancel();
                    hideAlert();
                }}
                cancelText={alertConfig.cancelText}
                icon={alertConfig.icon}
                onClose={hideAlert}
            />
            <ModernToast
                visible={toastConfig.visible}
                message={toastConfig.message}
                type={toastConfig.type}
                onClose={() => setToastConfig((prev) => ({ ...prev, visible: false }))}
            />
        </AlertContext.Provider>
    );
};
