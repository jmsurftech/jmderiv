import React from 'react';

import { TooltipPortal } from '@deriv/components';
import { useDevice } from '@deriv-com/ui';

import { getTermDefinition } from 'AppV2/Utils/contract-description-utils';

type TTermButton = {
    term: string;
    contract_type: string;
    onTermClick: (term: string) => void;
    children?: React.ReactNode;
};

const TermButton = ({ term, contract_type, onTermClick, children }: TTermButton) => {
    const { isMobile } = useDevice();
    const definition = getTermDefinition({ term, contract_type });

    if (isMobile) {
        return (
            <button
                className='description__content--definition'
                onClick={() => onTermClick(term)}
                aria-label={`View definition of ${term}`}
                type='button'
            >
                {children}
            </button>
        );
    }

    return (
        <TooltipPortal message={definition} position='top' className='guide-definition-tooltip'>
            <button
                className='description__content--definition'
                onClick={() => onTermClick(term)}
                aria-label={`View definition of ${term}`}
                type='button'
            >
                {children}
            </button>
        </TooltipPortal>
    );
};

export default TermButton;
