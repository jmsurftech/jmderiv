import React from 'react';

import { redirectToLogin, trackAnalyticsEvent } from '@deriv/shared';
import { mockStore, StoreProvider } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AccountHeader from '../account-header';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getCurrencyDisplayCode: jest.fn((currency: string) => currency),
    redirectToLogin: jest.fn(),
    trackAnalyticsEvent: jest.fn(),
}));

jest.mock('@deriv/core/src/App/Components/Layout/Header/account-info-icon', () => {
    return jest.fn(() => <div data-testid='account-info-icon'>Icon</div>);
});

describe('AccountHeader', () => {
    const default_mock_store = mockStore({
        client: {
            balance: '10,000.00',
            currency: 'USD',
            is_logged_in: true,
            is_virtual: false,
            logout: jest.fn(),
        },
    });

    const renderComponent = (store = default_mock_store, props = {}) => {
        return render(
            <StoreProvider store={store}>
                <AccountHeader {...props} />
            </StoreProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Logged in state', () => {
        it('should render account info with balance for logged in real account', () => {
            renderComponent();

            expect(screen.getByText('Real')).toBeInTheDocument();
            expect(screen.getByText('10,000.00 USD')).toBeInTheDocument();
            expect(screen.getByTestId('account-info-icon')).toBeInTheDocument();
        });

        it('should render account info with balance for logged in demo account', () => {
            const demo_store = mockStore({
                client: {
                    balance: '5,000.00',
                    currency: 'USD',
                    is_logged_in: true,
                    is_virtual: true,
                    logout: jest.fn(),
                },
            });

            renderComponent(demo_store);

            expect(screen.getByText('Demo')).toBeInTheDocument();
            expect(screen.getByText('5,000.00 USD')).toBeInTheDocument();
        });

        it('should render "No currency assigned" when currency is not set', () => {
            const no_currency_store = mockStore({
                client: {
                    balance: '0.00',
                    currency: '',
                    is_logged_in: true,
                    is_virtual: false,
                    logout: jest.fn(),
                },
            });

            renderComponent(no_currency_store);

            expect(screen.getByText('No currency assigned')).toBeInTheDocument();
        });

        it('should render transfer button for logged in real account users', () => {
            renderComponent();

            const transferButton = screen.getByRole('button', { name: /transfer/i });
            expect(transferButton).toBeInTheDocument();
            expect(transferButton).toHaveAttribute('type', 'button');
            expect(transferButton).toHaveClass('account-header__transfer');
        });

        it('should render manage button for logged in demo account users', () => {
            const demo_store = mockStore({
                client: {
                    balance: '5,000.00',
                    currency: 'USD',
                    is_logged_in: true,
                    is_virtual: true,
                    logout: jest.fn(),
                },
            });

            renderComponent(demo_store);

            const manageButton = screen.getByRole('button', { name: /manage/i });
            expect(manageButton).toBeInTheDocument();
            expect(manageButton).toHaveAttribute('type', 'button');
            expect(manageButton).toHaveClass('account-header__transfer');
        });
        describe('Invalid balance handling', () => {
            it('should display dash with currency when balance is NaN', () => {
                const nan_balance_store = mockStore({
                    client: {
                        balance: 'NaN',
                        currency: 'USD',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(nan_balance_store);

                expect(screen.getByText('0.00 USD')).toBeInTheDocument();
                expect(screen.queryByText('NaN USD')).not.toBeInTheDocument();
            });

            it('should display dash with currency when balance is null', () => {
                const null_balance_store = mockStore({
                    client: {
                        balance: null as any,
                        currency: 'EUR',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(null_balance_store);

                expect(screen.getByText('0.00 EUR')).toBeInTheDocument();
            });

            it('should display dash with currency when balance is undefined', () => {
                const undefined_balance_store = mockStore({
                    client: {
                        balance: undefined,
                        currency: 'GBP',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(undefined_balance_store);

                expect(screen.getByText('0.00 GBP')).toBeInTheDocument();
            });

            it('should display dash with currency when balance is empty string', () => {
                const empty_balance_store = mockStore({
                    client: {
                        balance: '',
                        currency: 'AUD',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(empty_balance_store);

                expect(screen.getByText('0.00 AUD')).toBeInTheDocument();
            });

            it('should display dash with currency when balance is invalid string', () => {
                const invalid_balance_store = mockStore({
                    client: {
                        balance: 'invalid',
                        currency: 'CAD',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(invalid_balance_store);

                expect(screen.getByText('0.00 CAD')).toBeInTheDocument();
                expect(screen.queryByText('invalid CAD')).not.toBeInTheDocument();
            });

            it('should display balance correctly when balance is a number type', () => {
                renderComponent(default_mock_store, {
                    balance: 1000.5,
                    currency: 'USD',
                    is_logged_in: true,
                    is_virtual: false,
                });

                expect(screen.getByText('1,000.50 USD')).toBeInTheDocument();
            });

            it('should display numeric 0 balance correctly as 0.00', () => {
                renderComponent(default_mock_store, {
                    balance: 0,
                    currency: 'USD',
                    is_logged_in: true,
                    is_virtual: false,
                });

                expect(screen.getByText('0.00 USD')).toBeInTheDocument();
                expect(screen.queryByText('0.00 USD')).toBeInTheDocument();
            });

            it('should display balance correctly when balance is comma-formatted string', () => {
                const comma_balance_store = mockStore({
                    client: {
                        balance: '10,000.00',
                        currency: 'USD',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(comma_balance_store);

                expect(screen.getByText('10,000.00 USD')).toBeInTheDocument();
            });

            it('should not render balance section when currency is missing and balance is invalid', () => {
                const no_currency_invalid_balance_store = mockStore({
                    client: {
                        balance: 'NaN',
                        currency: '',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(no_currency_invalid_balance_store);

                expect(screen.getByText('No currency assigned')).toBeInTheDocument();
                expect(screen.queryByText(/^- $/)).not.toBeInTheDocument();
            });

            it('should handle zero balance correctly', () => {
                const zero_balance_store = mockStore({
                    client: {
                        balance: '0.00',
                        currency: 'USD',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(zero_balance_store);

                expect(screen.getByText('0.00 USD')).toBeInTheDocument();
            });

            it('should handle negative balance correctly', () => {
                const negative_balance_store = mockStore({
                    client: {
                        balance: '-500.00',
                        currency: 'USD',
                        is_logged_in: true,
                        is_virtual: false,
                        logout: jest.fn(),
                    },
                });

                renderComponent(negative_balance_store);

                expect(screen.getByText('-500.00 USD')).toBeInTheDocument();
            });
        });
    });

    describe('Logged out state', () => {
        it('should not render account info for logged out users', () => {
            const logged_out_store = mockStore({
                client: {
                    balance: '',
                    currency: '',
                    is_logged_in: false,
                    is_virtual: false,
                    logout: jest.fn(),
                },
            });

            renderComponent(logged_out_store);

            expect(screen.queryByTestId('account-info-icon')).not.toBeInTheDocument();
            expect(screen.queryByText('Real')).not.toBeInTheDocument();
            expect(screen.queryByText('Demo')).not.toBeInTheDocument();
        });

        it('should render login button for logged out users', () => {
            const logged_out_store = mockStore({
                client: {
                    balance: '',
                    currency: '',
                    is_logged_in: false,
                    is_virtual: false,
                    logout: jest.fn(),
                },
            });

            renderComponent(logged_out_store);

            const loginButton = screen.getByRole('button', { name: /log in/i });
            expect(loginButton).toBeInTheDocument();
            expect(loginButton).toHaveAttribute('type', 'button');
            expect(loginButton).toHaveClass('account-header__login');
        });

        it('should call redirectToLogin when login button is clicked', async () => {
            const logged_out_store = mockStore({
                client: {
                    balance: '',
                    currency: '',
                    is_logged_in: false,
                    is_virtual: false,
                    logout: jest.fn(),
                },
            });

            renderComponent(logged_out_store);

            const loginButton = screen.getByRole('button', { name: /log in/i });
            await userEvent.click(loginButton);

            expect(redirectToLogin).toHaveBeenCalledTimes(1);
        });
    });

    describe('Props override', () => {
        it('should use props values when provided instead of store values', () => {
            renderComponent(default_mock_store, {
                balance: '5,000.00',
                currency: 'EUR',
                is_logged_in: true,
                is_virtual: true,
            });

            expect(screen.getByText('Demo')).toBeInTheDocument();
            expect(screen.getByText('5,000.00 EUR')).toBeInTheDocument();
        });

        it('should fall back to store values when props are not provided', () => {
            renderComponent();

            expect(screen.getByText('Real')).toBeInTheDocument();
            expect(screen.getByText('10,000.00 USD')).toBeInTheDocument();
        });

        it('should handle mixed props and store values correctly', () => {
            renderComponent(default_mock_store, {
                balance: '2,500.00',
                // currency and is_logged_in will come from store
            });

            expect(screen.getByText('2,500.00 USD')).toBeInTheDocument();
            expect(screen.getByText('Real')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper aria-label for transfer button with correct value for real account', () => {
            renderComponent();

            const transferButton = screen.getByRole('button', { name: /transfer/i });
            expect(transferButton).toHaveAttribute('aria-label', 'Transfer');
        });

        it('should have proper aria-label for manage button with correct value for demo account', () => {
            const demo_store = mockStore({
                client: {
                    balance: '5,000.00',
                    currency: 'USD',
                    is_logged_in: true,
                    is_virtual: true,
                    logout: jest.fn(),
                },
            });

            renderComponent(demo_store);

            const manageButton = screen.getByRole('button', { name: /manage/i });
            expect(manageButton).toHaveAttribute('aria-label', 'Manage');
        });

        it('should have proper aria-label for login button with correct value', () => {
            const logged_out_store = mockStore({
                client: {
                    balance: '',
                    currency: '',
                    is_logged_in: false,
                    is_virtual: false,
                    logout: jest.fn(),
                },
            });

            renderComponent(logged_out_store);

            const loginButton = screen.getByRole('button', { name: /log in/i });
            expect(loginButton).toHaveAttribute('aria-label', 'Log in');
        });

        it('should have type="button" on transfer button', () => {
            renderComponent();

            const transferButton = screen.getByRole('button', { name: /transfer/i });
            expect(transferButton).toHaveAttribute('type', 'button');
        });

        it('should have type="button" on login button', () => {
            const logged_out_store = mockStore({
                client: {
                    balance: '',
                    currency: '',
                    is_logged_in: false,
                    is_virtual: false,
                    logout: jest.fn(),
                },
            });

            renderComponent(logged_out_store);

            const loginButton = screen.getByRole('button', { name: /log in/i });
            expect(loginButton).toHaveAttribute('type', 'button');
        });
        describe('Analytics tracking', () => {
            it('should track analytics event when transfer button is clicked for real account', async () => {
                renderComponent();

                const transferButton = screen.getByRole('button', { name: /transfer/i });
                await userEvent.click(transferButton);

                expect(trackAnalyticsEvent).toHaveBeenCalledWith('ce_trade_types_form_v2', {
                    action: 'click',
                    button_type: 'transfer',
                });
            });

            it('should track analytics event when manage button is clicked for demo account', async () => {
                const demo_store = mockStore({
                    client: {
                        balance: '5,000.00',
                        currency: 'USD',
                        is_logged_in: true,
                        is_virtual: true,
                        logout: jest.fn(),
                    },
                });

                renderComponent(demo_store);

                const manageButton = screen.getByRole('button', { name: /manage/i });
                await userEvent.click(manageButton);

                expect(trackAnalyticsEvent).toHaveBeenCalledWith('ce_trade_types_form_v2', {
                    action: 'click',
                    button_type: 'manage',
                });
            });

            it('should call trackAnalyticsEvent before navigation for transfer button', async () => {
                const callOrder: string[] = [];

                (trackAnalyticsEvent as jest.Mock).mockImplementation(() => {
                    callOrder.push('analytics');
                });

                // Mock window.location.href setter
                delete (window as any).location;
                window.location = { href: '' } as any;
                Object.defineProperty(window.location, 'href', {
                    set: jest.fn(() => {
                        callOrder.push('navigation');
                    }),
                    get: jest.fn(),
                });

                renderComponent();

                const transferButton = screen.getByRole('button', { name: /transfer/i });
                await userEvent.click(transferButton);

                expect(callOrder).toEqual(['analytics', 'navigation']);
            });

            it('should call trackAnalyticsEvent before navigation for manage button', async () => {
                const callOrder: string[] = [];

                (trackAnalyticsEvent as jest.Mock).mockImplementation(() => {
                    callOrder.push('analytics');
                });

                // Mock window.location.href setter
                delete (window as any).location;
                window.location = { href: '' } as any;
                Object.defineProperty(window.location, 'href', {
                    set: jest.fn(() => {
                        callOrder.push('navigation');
                    }),
                    get: jest.fn(),
                });

                const demo_store = mockStore({
                    client: {
                        balance: '5,000.00',
                        currency: 'USD',
                        is_logged_in: true,
                        is_virtual: true,
                        logout: jest.fn(),
                    },
                });

                renderComponent(demo_store);

                const manageButton = screen.getByRole('button', { name: /manage/i });
                await userEvent.click(manageButton);

                expect(callOrder).toEqual(['analytics', 'navigation']);
            });
        });

        it('should have display name', () => {
            expect(AccountHeader.displayName).toBe('AccountHeader');
        });
    });
});
