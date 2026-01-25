import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, Check, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

/**
 * Payment Callback Screen
 * This screen handles redirects from payment providers after payment completion
 * 
 * Deep Link URLs:
 * - Success: erpmobileapp://payment-callback?status=success&reference=xxx
 * - Failed: erpmobileapp://payment-callback?status=failed&reference=xxx
 * - Cancelled: erpmobileapp://payment-callback?status=cancelled
 */
export default function PaymentCallbackScreen() {
    const params = useLocalSearchParams<{
        status?: string;
        reference?: string;
        trxref?: string;
    }>();
    const router = useRouter();

    const status = params.status || 'success';
    const reference = params.reference || params.trxref || '';

    useEffect(() => {
        // Auto-redirect to dashboard after 3 seconds
        const timer = setTimeout(() => {
            router.replace('/dashboard');
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <Check size={48} color="#10B981" />,
                    bgColor: 'bg-emerald-100',
                    borderColor: 'border-emerald-200',
                    title: 'Payment Successful!',
                    titleColor: 'text-emerald-700',
                    message: 'Your subscription has been activated. You will be redirected to the dashboard shortly.',
                    messageColor: 'text-emerald-600',
                };
            case 'failed':
                return {
                    icon: <X size={48} color="#EF4444" />,
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-200',
                    title: 'Payment Failed',
                    titleColor: 'text-red-700',
                    message: 'There was an issue processing your payment. Please try again.',
                    messageColor: 'text-red-600',
                };
            case 'cancelled':
                return {
                    icon: <AlertCircle size={48} color="#F59E0B" />,
                    bgColor: 'bg-amber-100',
                    borderColor: 'border-amber-200',
                    title: 'Payment Cancelled',
                    titleColor: 'text-amber-700',
                    message: 'You cancelled the payment. You can try again anytime.',
                    messageColor: 'text-amber-600',
                };
            default:
                return {
                    icon: <AlertCircle size={48} color="#6366F1" />,
                    bgColor: 'bg-indigo-100',
                    borderColor: 'border-indigo-200',
                    title: 'Processing...',
                    titleColor: 'text-indigo-700',
                    message: 'Please wait while we confirm your payment status.',
                    messageColor: 'text-indigo-600',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <View className="flex-1 bg-slate-50 items-center justify-center p-6">
            <View className={`w-full max-w-sm ${config.bgColor} ${config.borderColor} border-2 rounded-3xl p-8 items-center shadow-lg`}>
                {/* Icon */}
                <View className={`w-24 h-24 rounded-full ${config.bgColor} items-center justify-center mb-6 border-4 ${config.borderColor}`}>
                    {config.icon}
                </View>

                {/* Title */}
                <Text className={`text-2xl font-bold ${config.titleColor} text-center mb-3`}>
                    {config.title}
                </Text>

                {/* Message */}
                <Text className={`${config.messageColor} text-center text-base leading-6 mb-6`}>
                    {config.message}
                </Text>

                {/* Reference Number */}
                {reference && (
                    <View className="bg-white/50 px-4 py-2 rounded-xl mb-6">
                        <Text className="text-xs text-slate-500 text-center">Reference</Text>
                        <Text className="text-sm font-mono text-slate-700 text-center">{reference}</Text>
                    </View>
                )}

                {/* Redirecting Indicator */}
                <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#6366F1" />
                    <Text className="text-slate-500 text-sm">Redirecting to dashboard...</Text>
                </View>
            </View>
        </View>
    );
}
