import { render, screen } from '@testing-library/react';
import { ReferralCard } from './ReferralCard';

describe('ReferralCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders referral card after fetching data', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            referralCode: 'TEST1234',
            referralLink: 'https://presusimple.com?ref=TEST1234',
            referredCount: 3,
          }),
      })
    ) as jest.Mock;

    render(<ReferralCard />);

    expect(await screen.findByText(/Invite Friends/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://presusimple.com?ref=TEST1234')).toBeInTheDocument();
    expect(screen.getByText(/3 friends joined/i)).toBeInTheDocument();
  });
});
