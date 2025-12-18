import React, { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import { TextField } from '@deriv-com/quill-ui';
import { Localize } from '@deriv-com/translations';

import { useTraderStore } from 'Stores/useTraderStores';

import { InputPopover } from '../../InputPopover';

import BarrierContentDesktop from './barrier-content-desktop';
import BarrierTypeSelector from './barrier-type-selector';

interface BarrierDesktopProps {
    is_minimized?: boolean;
}

const BarrierDesktop: React.FC<BarrierDesktopProps> = observer(({ is_minimized }) => {
    const { barrier_1, is_market_closed } = useTraderStore();

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('above_spot');
    const inputRef = useRef<HTMLDivElement>(null);

    const handleOpenPopover = useCallback(() => {
        setIsPopoverOpen(true);
    }, []);

    const handleClosePopover = useCallback(() => {
        setIsPopoverOpen(false);
    }, []);

    const handleTypeSelect = useCallback((type: string) => {
        setSelectedType(type);
    }, []);

    return (
        <>
            <div ref={inputRef}>
                <TextField
                    variant='fill'
                    readOnly
                    label={<Localize i18n_default_text='Barrier' key={`barrier${is_minimized ? '-minimized' : ''}`} />}
                    value={barrier_1}
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
                popoverWidth={424}
                className='barrier-popover'
            >
                <div className='barrier-popover__layout'>
                    <div className='barrier-popover__sidebar'>
                        <BarrierTypeSelector selectedType={selectedType} onSelectType={handleTypeSelect} />
                    </div>
                    <div className='barrier-popover__main'>
                        <div className='barrier-popover__content'>
                            <BarrierContentDesktop barrierType={selectedType} onClose={handleClosePopover} />
                        </div>
                    </div>
                </div>
            </InputPopover>
        </>
    );
});

export default BarrierDesktop;
