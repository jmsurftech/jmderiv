import React from 'react';

import { TRADE_TYPES } from '@deriv/shared';
import { mockStore, StoreProvider } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AVAILABLE_CONTRACTS, CONTRACT_LIST } from 'AppV2/Utils/trade-types-utils';

import TraderProviders from '../../../../trader-providers';
import Guide from '../guide';

const trade_types = 'Trade types';

// Mock available contracts - matches the structure returned by useAvailableContracts
const mockAvailableContracts = [
    {
        tradeType: 'Accumulators',
        id: CONTRACT_LIST.ACCUMULATORS,
        for: [TRADE_TYPES.ACCUMULATOR],
    },
    {
        tradeType: 'Vanillas',
        id: CONTRACT_LIST.VANILLAS,
        for: [TRADE_TYPES.VANILLA.CALL, TRADE_TYPES.VANILLA.PUT],
    },
    {
        tradeType: 'Turbos',
        id: CONTRACT_LIST.TURBOS,
        for: [TRADE_TYPES.TURBOS.LONG, TRADE_TYPES.TURBOS.SHORT],
    },
    {
        tradeType: 'Multipliers',
        id: CONTRACT_LIST.MULTIPLIERS,
        for: [TRADE_TYPES.MULTIPLIER],
    },
    {
        tradeType: 'Rise/Fall',
        id: CONTRACT_LIST.RISE_FALL,
        for: [TRADE_TYPES.RISE_FALL, TRADE_TYPES.RISE_FALL_EQUAL],
    },
    {
        tradeType: 'Higher/Lower',
        id: CONTRACT_LIST.HIGHER_LOWER,
        for: [TRADE_TYPES.HIGH_LOW],
    },
    {
        tradeType: 'Touch/No Touch',
        id: CONTRACT_LIST.TOUCH_NO_TOUCH,
        for: [TRADE_TYPES.TOUCH],
    },
    {
        tradeType: 'Matches/Differs',
        id: CONTRACT_LIST.MATCHES_DIFFERS,
        for: [TRADE_TYPES.MATCH_DIFF],
    },
    { tradeType: 'Even/Odd', id: CONTRACT_LIST.EVEN_ODD, for: [TRADE_TYPES.EVEN_ODD] },
    {
        tradeType: 'Over/Under',
        id: CONTRACT_LIST.OVER_UNDER,
        for: [TRADE_TYPES.OVER_UNDER],
    },
];

const mock_contract_data = [
    {
        value: 'accumulator',
        text: 'Accumulators',
        barrier_category: 'american',
    },
    {
        value: 'vanillalongcall',
        text: 'Vanillas',
        barrier_category: 'euro_atm',
    },
    {
        value: 'turboslong',
        text: 'Turbos',
        barrier_category: 'american',
    },
    {
        value: 'multiplier',
        text: 'Multipliers',
        barrier_category: 'american',
    },
    {
        value: 'rise_fall',
        text: 'Rise/Fall',
        barrier_category: 'euro_atm',
    },
    {
        value: 'high_low',
        text: 'Higher/Lower',
        barrier_category: 'euro_atm',
    },
    {
        value: 'touch',
        text: 'Touch/No Touch',
        barrier_category: 'american',
    },
    {
        value: 'match_diff',
        text: 'Matches/Differs',
        barrier_category: 'non_financial',
    },
    {
        value: 'even_odd',
        text: 'Even/Odd',
        barrier_category: 'non_financial',
    },
    {
        value: 'over_under',
        text: 'Over/Under',
        barrier_category: 'non_financial',
    },
];

jest.mock('@lottiefiles/dotlottie-react', () => ({
    DotLottieReact: jest.fn(() => <div>DotLottieReact</div>),
}));

jest.mock('AppV2/Hooks/useContractsFor', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        contracts_for: mock_contract_data,
        is_fetching_ref: { current: false },
        trade_types: mock_contract_data,
    })),
}));

jest.mock('AppV2/Hooks/useGuideContractTypes', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        trade_types: [
            { text: 'Accumulators', value: 'accumulator' },
            { text: 'Vanillas', value: 'vanillalongcall' },
            { text: 'Turbos', value: 'turboslong' },
            { text: 'Multipliers', value: 'multiplier' },
            { text: 'Rise/Fall', value: 'rise_fall' },
            { text: 'Higher/Lower', value: 'high_low' },
            { text: 'Touch/No Touch', value: 'touch' },
            { text: 'Matches/Differs', value: 'match_diff' },
            { text: 'Even/Odd', value: 'even_odd' },
            { text: 'Over/Under', value: 'over_under' },
        ],
    })),
}));

describe('Guide', () => {
    let default_mock_store: ReturnType<typeof mockStore>;

    beforeEach(() => {
        default_mock_store = mockStore({
            modules: { trade: { contract_type: TRADE_TYPES.RISE_FALL, is_vanilla: false } },
        });
    });
    const renderGuide = (
        mockProps: React.ComponentProps<typeof Guide> = { show_guide_for_selected_contract: false }
    ) => {
        render(
            <StoreProvider store={default_mock_store}>
                <TraderProviders store={default_mock_store}>
                    <Guide {...mockProps} />
                </TraderProviders>
            </StoreProvider>
        );
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render component with icon button and if user clicks on it, should show available contract information', async () => {
        renderGuide();

        const guideButton = screen.getByRole('button');
        expect(guideButton).toBeInTheDocument();

        await userEvent.click(guideButton);

        expect(screen.getByText(trade_types)).toBeInTheDocument();
        mockAvailableContracts.forEach(({ id }) => expect(screen.getByText(id)).toBeInTheDocument());
    });

    it('should render component with description for only for selected trade type if show_guide_for_selected_contract === true', async () => {
        renderGuide({ show_guide_for_selected_contract: true });

        await userEvent.click(screen.getByRole('button'));

        expect(screen.queryByText(trade_types)).not.toBeInTheDocument();
        expect(screen.getByText(CONTRACT_LIST.RISE_FALL)).toBeInTheDocument();

        mockAvailableContracts.forEach(({ id }) =>
            id === CONTRACT_LIST.RISE_FALL
                ? expect(screen.getByText(id)).toBeInTheDocument()
                : expect(screen.queryByText(id)).not.toBeInTheDocument()
        );
    });

    it('should render term definition if user clicked on it', async () => {
        renderGuide();

        const term_definition = 'You can choose a growth rate with values of 1%, 2%, 3%, 4%, and 5%.';
        expect(screen.queryByText(term_definition)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByText(CONTRACT_LIST.ACCUMULATORS));

        // Wait for the AccumulatorsTradeDescription component to load and find the text with "growth rate"
        const growth_rate_text = await screen.findByText(/growth rate/i, {}, { timeout: 3000 });
        await userEvent.click(growth_rate_text);

        expect(await screen.findByText(term_definition)).toBeInTheDocument();
    });
});
