import React from 'react';
import clsx from 'clsx';

import { getCurrencyDisplayCode } from '@deriv/shared';

import { TRADE_PARAMETER_PRESETS } from 'AppV2/Config/trade-parameter-presets';

type TStakeChipsProps = {
    currency: string;
    onChipSelect: (amount: number) => void;
    selected_amount?: number;
};

const StakeChips = ({ currency, onChipSelect, selected_amount }: TStakeChipsProps) => {
    return (
        <div className='stake-chips'>
            <div className='stake-chips__grid'>
                {TRADE_PARAMETER_PRESETS.stake.standard.map(value => (
                    <button
                        key={value}
                        type='button'
                        className={clsx('stake-chips__chip', {
                            'stake-chips__chip--selected': value === selected_amount,
                        })}
                        onClick={() => onChipSelect(value)}
                        aria-label={`Set stake to ${value} ${getCurrencyDisplayCode(currency)}`}
                    >
                        {value} {getCurrencyDisplayCode(currency)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StakeChips;
