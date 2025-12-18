import React from 'react';
import clsx from 'clsx';

import { TextField } from '@deriv-com/quill-ui';

import { InputPopover } from 'AppV2/Components/InputPopover';

type TTradeParameterPopoverProps = {
    label: React.ReactNode;
    value: string;
    is_minimized?: boolean;
    disabled?: boolean;
    has_error?: boolean;
    popover_classname: string;
    children: React.ReactNode;
    header?: React.ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
};

const TradeParameterPopover = ({
    label,
    value,
    is_minimized,
    disabled,
    has_error,
    popover_classname,
    children,
    header,
    onOpen: onOpenCallback,
    onClose: onCloseCallback,
}: TTradeParameterPopoverProps) => {
    const [is_open, setIsOpen] = React.useState(false);
    const field_ref = React.useRef<HTMLDivElement>(null);

    const onOpen = React.useCallback(() => {
        setIsOpen(true);
        onOpenCallback?.();
    }, [onOpenCallback]);

    const onClose = React.useCallback(() => {
        setIsOpen(false);
        onCloseCallback?.();
    }, [onCloseCallback]);

    return (
        <React.Fragment>
            <div ref={field_ref}>
                <TextField
                    disabled={disabled}
                    variant='fill'
                    readOnly
                    label={label}
                    noStatusIcon
                    onClick={onOpen}
                    value={value}
                    className={clsx('trade-params__option', is_minimized && 'trade-params__option--minimized')}
                    status={has_error ? 'error' : 'neutral'}
                />
            </div>
            <InputPopover isOpen={is_open} onClose={onClose} triggerRef={field_ref} className={popover_classname}>
                {header && <div className={`${popover_classname}__header`}>{header}</div>}
                {children}
            </InputPopover>
        </React.Fragment>
    );
};

export default TradeParameterPopover;
