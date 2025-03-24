import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Dimensions, Platform } from 'react-native';

const CustomAlert = {
    show: null,

    presets: {
        default: {
            containerStyle: {},
            titleStyle: {},
            messageStyle: {},
            buttonStyle: {},
            textInputStyle: {},
        },
        modern: {
            colors: {
                primary: '#3498db',
                light: '#f0f8ff',
                dark: '#2980b9',
                text: '#ffffff',
                neutral: '#7f8c8d'
            }
        }
    },

    _currentConfig: {
        visible: false,
        title: '',
        message: '',
        buttons: [],
        hasInput: false,
        inputConfig: {},
        preset: 'modern'
    }
};

const AlertModal = () => {
    const [state, setState] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: [],
        hasInput: false,
        inputConfig: {},
        inputValue: '',
        preset: 'modern'
    });

    const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const updateDimensions = () => {
            setWindowDimensions(Dimensions.get('window'));
        };

        Dimensions.addEventListener('change', updateDimensions);
        return () => {
            const dimensionsHandler = Dimensions.removeEventListener || Dimensions.addEventListener;
            if (dimensionsHandler) {
                dimensionsHandler('change', updateDimensions);
            }
        };
    }, []);

    const isDesktop = Platform.OS === 'web' && windowDimensions.width > 768;

    CustomAlert.show = (config) => {
        setState(prevState => ({
            ...prevState,
            ...config,
            visible: true,
            hasInput: config.hasInput || !!config.inputConfig,
            inputValue: config.inputConfig?.defaultValue || ''
        }));
    };

    const closeAlert = () => {
        setState(prevState => ({ ...prevState, visible: false }));
    };

    const handleButtonPress = (onPress, shouldClose = true) => {
        if (onPress) {
            onPress(state.inputValue);
        }
        if (shouldClose) {
            closeAlert();
        }
    };

    const getButtonStyle = (index) => {
        const preset = CustomAlert.presets.modern;
        const buttonCount = state.buttons.length;

        if (buttonCount === 1) {
            return {
                backgroundColor: preset.colors.primary,
                width: '100%',
            };
        }

        if (buttonCount === 2) {
            return index === 0
                ? {
                    backgroundColor: '#FFE5E5',
                    width: '48%',

                }
                : {
                    backgroundColor: '#E5FFE5',
                    width: '48%',

                };
        }

        return {
            backgroundColor: preset.colors.primary,
            width: '100%',
        };
    };

    const getButtonTextStyle = (index) => {
        const preset = CustomAlert.presets.modern;
        const buttonCount = state.buttons.length;

        if (buttonCount === 2) {
            return index === 0
                ? { color: '#FF0000' }
                : { color: '#00A000' };
        }

        return { color: preset.colors.text };
    };

    return (
        <Modal
            transparent={true}
            visible={state.visible}
            animationType="fade"
            onRequestClose={closeAlert}
        >
            <View style={[
                styles.overlay,
                isDesktop && styles.desktopOverlay
            ]}>
                <View style={[
                    styles.container,
                    isDesktop && styles.desktopContainer
                ]}>
                    {state.title ? (
                        <Text style={[styles.title, isDesktop && styles.desktopTitle]}>{state.title}</Text>
                    ) : null}

                    <Text style={[styles.message, isDesktop && styles.desktopMessage]}>{state.message}</Text>

                    {state.hasInput && (
                        <TextInput
                            style={[styles.input, isDesktop && styles.desktopInput]}
                            placeholder={state.inputConfig?.placeholder || 'Enter text'}
                            value={state.inputValue}
                            onChangeText={(text) => setState(prev => ({...prev, inputValue: text}))}
                            {...state.inputConfig}
                        />
                    )}

                    <View style={[styles.buttonContainer, isDesktop && styles.desktopButtonContainer]}>
                        {state.buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    getButtonStyle(index),
                                    isDesktop && styles.desktopButton
                                ]}
                                onPress={() => handleButtonPress(button.onPress, button.shouldClose)}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    getButtonTextStyle(index),
                                    isDesktop && styles.desktopButtonText
                                ]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    desktopOverlay: {
        justifyContent: 'center',
        paddingBottom: 0,
    },
    container: {
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 20,
        alignItems: 'center',
        minHeight: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: 'space-between',
    },
    desktopContainer: {
        width: '50%',
        maxWidth: 500,
        minWidth: 400,
        minHeight: 300,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 0 },
        paddingVertical: 40,
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
    },
    desktopTitle: {
        fontSize: 24,
        marginBottom: 20,
    },
    message: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#34495e',
    },
    desktopMessage: {
        fontSize: 16,
        marginBottom: 25,
        maxWidth: '90%',
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 35,
    },
    desktopButtonContainer: {
        marginTop: 35,
        maxWidth: 400,
    },
    button: {
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    desktopButton: {
        padding: 14,
        minWidth: 120,
    },
    buttonText: {
        fontWeight: 'bold',
    },
    desktopButtonText: {
        fontSize: 16,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#3498db',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    desktopInput: {
        padding: 14,
        fontSize: 16,
        maxWidth: 400,
    },
});


export default function CustomAlertProvider() {
    return <AlertModal />;
}


export const showAlert = (options) => {

    if (options.hasInput || options.inputConfig) {
        CustomAlert.show({
            title: options.title,
            message: options.message,
            buttons: options.buttons || [],
            hasInput: true,
            inputConfig: options.inputConfig || {},
        });
    }

    else {
        CustomAlert.show({
            title: options.title,
            message: options.message,
            buttons: options.buttons || [],
            hasInput: false,
        });
    }
};

// Usage
/*
useEffect(() => {
        showAlert({
            title: 'Enter Name',
            message: 'Please enter your name',
            buttons: [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancelled')
                },
                {
                    text: 'Submit',
                    onPress: (inputValue) => console.log('Submitted:', inputValue)
                }
            ],
        });
    }, []);


    return (
        <>
            <CustomAlertProvider />
        </>);
 */