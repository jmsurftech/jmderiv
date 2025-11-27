import { observer } from 'mobx-react-lite';

import { Button, Text } from '@deriv/components';
import AccountInfoIcon from '@deriv/core/src/App/Components/Layout/Header/account-info-icon';
import { addComma, getBrandUrl, getCurrencyDisplayCode, redirectToLogin, trackAnalyticsEvent } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { Localize, useTranslations } from '@deriv-com/translations';

type AccountHeaderProps = {
    balance?: string | number;
    currency?: string;
    is_logged_in?: boolean;
    is_virtual?: boolean;
};

const AccountHeader = observer(
    ({
        balance: balanceProp,
        currency: currencyProp,
        is_logged_in: isLoggedInProp,
        is_virtual: isVirtualProp,
    }: AccountHeaderProps = {}) => {
        const { localize } = useTranslations();
        const { client, common } = useStore();

        // Use props if provided, otherwise fall back to store
        const balance = balanceProp ?? client.balance;
        const currency = currencyProp ?? client.currency;
        const is_logged_in = isLoggedInProp ?? client.is_logged_in;
        const is_virtual = isVirtualProp ?? client.is_virtual;

        // Check if balance is a valid number (handles comma-formatted strings like "10,000.00" and numeric 0)
        const isValidBalance =
            balance !== undefined &&
            balance !== null &&
            balance !== '' &&
            // (typeof balance === 'number' || !isNaN(Number(String(balance).replace(/,/g, ''))));
            !isNaN(Number(String(balance).replace(/,/g, '')));

        const currency_lower = currency?.toLowerCase();
        const accountTypeHeader = is_virtual ? localize('Demo') : localize('Real');
        const isDemoAccount = is_virtual;

        const handleTransferClick = () => {
            const brandUrl = getBrandUrl();
            const lang_param = common.current_language ? `&lang=${common.current_language}` : '';

            // Track analytics event
            const eventName = 'ce_trade_types_form_v2';
            const buttonType = is_virtual ? 'manage' : 'transfer';

            trackAnalyticsEvent(eventName, {
                action: 'click',
                button_type: buttonType,
            });

            if (is_virtual) {
                window.location.href = `${brandUrl}/options?acc=options&curr=${currency}&from=home&source=options${lang_param}`;
            } else {
                window.location.href = `${brandUrl}/transfer?acc=options&curr=${currency}&from=home&source=options${lang_param}`;
            }
        };

        return (
            <div className='account-header'>
                {is_logged_in && (
                    <div className='account-header__info'>
                        <span className='account-header__icon'>
                            <AccountInfoIcon is_demo={isDemoAccount} currency={currency_lower} />
                        </span>
                        <div className='account-header__content'>
                            <Text as='p' size='xxs' className='account-header__type'>
                                {accountTypeHeader}
                            </Text>
                            <p className='account-header__balance'>
                                {!currency ? (
                                    <Localize i18n_default_text='No currency assigned' />
                                ) : isValidBalance ? (
                                    `${addComma(balance, 2)} ${getCurrencyDisplayCode(currency)}`
                                ) : (
                                    `0.00 ${getCurrencyDisplayCode(currency)}`
                                )}
                            </p>
                        </div>
                    </div>
                )}
                {is_logged_in ? (
                    <Button
                        className='account-header__transfer'
                        onClick={handleTransferClick}
                        aria-label={is_virtual ? localize('Manage') : localize('Transfer')}
                        type='button'
                    >
                        <Text size='xs' weight='bold' color='white'>
                            {is_virtual ? (
                                <Localize i18n_default_text='Manage' />
                            ) : (
                                <Localize i18n_default_text='Transfer' />
                            )}
                        </Text>
                    </Button>
                ) : (
                    <Button
                        className='account-header__login'
                        onClick={redirectToLogin}
                        aria-label={localize('Log in')}
                        type='button'
                    >
                        <Text size='xs' weight='bold' color='white'>
                            <Localize i18n_default_text='Log in' />
                        </Text>
                    </Button>
                )}
            </div>
        );
    }
);

AccountHeader.displayName = 'AccountHeader';

export default AccountHeader;
