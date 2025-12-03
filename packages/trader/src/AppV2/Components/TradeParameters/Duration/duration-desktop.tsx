import React, { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import { Text, TextField } from '@deriv-com/quill-ui';
import { Localize } from '@deriv-com/translations';

import { useTraderStore } from 'Stores/useTraderStores';

import { InputPopover, ValueChips } from '../../InputPopover';

import DurationUnitSelector from './duration-unit-selector';

const DURATION_TICK_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface DurationDesktopProps {
    is_minimized?: boolean;
}

const DurationDesktop: React.FC<DurationDesktopProps> = observer(({ is_minimized }) => {
    const { duration, duration_unit, onChangeMultiple, is_market_closed } = useTraderStore();

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState('t'); // Default to Ticks
    const [selectedDuration, setSelectedDuration] = useState(duration);
    const inputRef = useRef<HTMLDivElement>(null);

    const handleOpenPopover = useCallback(() => {
        setIsPopoverOpen(true);
        setSelectedUnit(duration_unit === 't' ? 't' : 't'); // Always default to ticks for now
        setSelectedDuration(duration);
    }, [duration, duration_unit]);

    const handleClosePopover = useCallback(() => {
        setIsPopoverOpen(false);
    }, []);

    const handleUnitSelect = useCallback((unit: string) => {
        setSelectedUnit(unit);
    }, []);

    const handleDurationSelect = useCallback(
        (value: number) => {
            setSelectedDuration(value);
            // Apply the change immediately
            onChangeMultiple({
                duration_unit: 't',
                duration: value,
                expiry_type: 'duration',
            });
            handleClosePopover();
        },
        [onChangeMultiple, handleClosePopover]
    );

    const formatTickValue = useCallback((value: number) => {
        return `${value} ${value === 1 ? 'tick' : 'ticks'}`;
    }, []);

    const getDisplayValue = useCallback(() => {
        if (duration_unit === 't') {
            return formatTickValue(duration);
        }
        return `${duration} ${duration_unit}`;
    }, [duration, duration_unit, formatTickValue]);

    return (
        <>
            <div ref={inputRef}>
                <TextField
                    variant='fill'
                    readOnly
                    label={
                        <Localize i18n_default_text='Duration' key={`duration${is_minimized ? '-minimized' : ''}`} />
                    }
                    value={getDisplayValue()}
                    noStatusIcon
                    disabled={is_market_closed}
                    className={clsx('trade-params__option', is_minimized && 'trade-params__option--minimized')}
                    onClick={handleOpenPopover}
                />
            </div>

            <InputPopover
                isOpen={isPopoverOpen}
                onClose={handleClosePopover}
                triggerRef={inputRef}
                className='duration-popover'
            >
                <div className='duration-popover__layout'>
                    <div className='duration-popover__sidebar'>
                        <DurationUnitSelector selectedUnit={selectedUnit} onSelectUnit={handleUnitSelect} />
                    </div>
                    <div className='duration-popover__main'>
                        <div className='duration-popover__content'>
                            {selectedUnit === 't' ? (
                                <ValueChips
                                    values={DURATION_TICK_VALUES}
                                    selectedValue={selectedDuration}
                                    onSelect={handleDurationSelect}
                                    formatValue={formatTickValue}
                                />
                            ) : (
                                <div className='duration-popover__coming-soon'>
                                    <Text size='md' color='quill-typography-default'>
                                        <Localize i18n_default_text='Coming soon' />
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </InputPopover>
        </>
    );
});

export default DurationDesktop;
