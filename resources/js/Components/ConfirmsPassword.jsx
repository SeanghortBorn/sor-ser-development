import React, { useRef, useState } from 'react';
import axios from 'axios';
import DialogModal from './DialogModal';
import TextInput from './TextInput';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function ConfirmsPassword({ children, onConfirmed, title = 'Confirm Password', content = 'For your security, please confirm your password to continue.', button = 'Confirm' }) {
    const [confirming, setConfirming] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const passwordInput = useRef();

    const startConfirmingPassword = async () => {
        const response = await axios.get(route('password.confirmation'));
        if (response.data.confirmed) {
            onConfirmed();
        } else {
            setConfirming(true);
            setTimeout(() => passwordInput.current?.focus(), 250);
        }
    };

    const confirmPassword = async () => {
        setProcessing(true);
        try {
            await axios.post(route('password.confirm'), { password });
            setProcessing(false);
            setConfirming(false);
            setPassword('');
            setError('');
            onConfirmed();
        } catch (err) {
            setProcessing(false);
            setError(err.response?.data?.errors?.password?.[0] || 'Something went wrong.');
            passwordInput.current?.focus();
        }
    };

    const closeModal = () => {
        setConfirming(false);
        setPassword('');
        setError('');
    };

    return (
        <>
            <span onClick={startConfirmingPassword}>
                {children}
            </span>

            <DialogModal
                show={confirming}
                onClose={closeModal}
                title={title}
                content={
                    <>
                        <p>{content}</p>
                        <div className="mt-4">
                            <TextInput
                                ref={passwordInput}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-3/4"
                                placeholder="Password"
                                autoComplete="current-password"
                                onKeyUp={(e) => e.key === 'Enter' && confirmPassword()}
                            />
                            <InputError message={error} className="mt-2" />
                        </div>
                    </>
                }
                footer={
                    <>
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <PrimaryButton
                            className="ms-3"
                            disabled={processing}
                            onClick={confirmPassword}
                        >
                            {button}
                        </PrimaryButton>
                    </>
                }
            />
        </>
    );
}
