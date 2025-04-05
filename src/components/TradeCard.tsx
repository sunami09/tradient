import React, { useState } from 'react';

type TabType = 'buy' | 'sell';
type BuyInType = 'Dollars' | 'Shares';

interface TradeCardProps {
  symbol?: string;
}

const TradeCard: React.FC<TradeCardProps> = ({ symbol = 'SPY' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('buy');
  const [buyInType, setBuyInType] = useState<BuyInType>('Dollars');
  const [amount, setAmount] = useState<string>('');
  const [showBuyOrderDropdown, setShowBuyOrderDropdown] = useState<boolean>(false);
  const [showBuyInDropdown, setShowBuyInDropdown] = useState<boolean>(false);

  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);
    console.log(`Clicked ${tab} tab`);
  };

  const toggleBuyOrderDropdown = () => {
    setShowBuyOrderDropdown(!showBuyOrderDropdown);
    console.log('Clicked order type dropdown');
  };

  const toggleBuyInDropdown = () => {
    setShowBuyInDropdown(!showBuyInDropdown);
    console.log('Clicked buy in dropdown');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const handleReviewOrder = (): void => {
    console.log({
      orderType: activeTab === 'buy' ? 'Buy order' : 'Sell order',
      symbol,
      buyInType,
      amount: amount || '0.00'
    });
  };

  const handleBuyInSelect = (type: BuyInType): void => {
    setBuyInType(type);
    setShowBuyInDropdown(false);
    console.log(`Selected ${type}`);
  };

  // No quick select amount buttons

  return (
    <div style={{
      backgroundColor: '#1E2124',
      borderRadius: '8px',
      padding: '23px',
      paddingLeft: "25px",
      width: '100%',
      maxWidth: '350px',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #333',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        <button 
          style={{
            flex: 1,
            padding: '8px 0',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'buy' ? 'rgba(204, 247, 89, 1)' : '#999',
            borderBottom: activeTab === 'buy' ? '2px solid rgba(204, 247, 89, 1)' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => handleTabChange('buy')}
        >
          Buy {symbol}
        </button>
        <button 
          style={{
            flex: 1,
            padding: '8px 0',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'sell' ? 'rgba(204, 247, 89, 1)' : '#999',
            borderBottom: activeTab === 'sell' ? '2px solid rgba(204, 247, 89, 1)' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => handleTabChange('sell')}
        >
          Sell {symbol}
        </button>
      </div>

      {/* Order type */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#999', fontSize: '14px' }}>
          Order type
        </label>
        <div 
          style={{
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              borderRadius: showBuyOrderDropdown ? '4px 4px 0 0' : '4px',
              border: '1px solid #333',
              borderBottom: showBuyOrderDropdown ? 'none' : '1px solid #333',
              justifyContent: 'space-between',
              backgroundColor: '#2a2e33'
            }}
            onClick={toggleBuyOrderDropdown}
          >
            <span>{activeTab === 'buy' ? 'Buy order' : 'Sell order'}</span>
            <span style={{ color: '#999' }}>▼</span>
          </div>
          {showBuyOrderDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#2a2e33',
              border: '1px solid #333',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              marginTop: '0',
              zIndex: 10
            }}>
              <div 
                style={{
                  padding: '12px 15px',
                  cursor: 'pointer'
                }}
                onClick={toggleBuyOrderDropdown}
              >
                {activeTab === 'buy' ? 'Buy order' : 'Sell order'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buy In */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#999', fontSize: '14px' }}>
          Buy In
        </label>
        <div 
          style={{
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              borderRadius: showBuyInDropdown ? '4px 4px 0 0' : '4px',
              border: '1px solid #333',
              borderBottom: showBuyInDropdown ? 'none' : '1px solid #333',
              justifyContent: 'space-between',
              backgroundColor: '#2a2e33'
            }}
            onClick={toggleBuyInDropdown}
          >
            <span>{buyInType}</span>
            <span style={{ color: '#999' }}>▼</span>
          </div>
          {showBuyInDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#2a2e33',
              border: '1px solid #333',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              marginTop: '0',
              zIndex: 10
            }}>
              <div 
                style={{
                  padding: '12px 15px',
                  borderBottom: '1px solid #333',
                  cursor: 'pointer'
                }}
                onClick={() => handleBuyInSelect('Dollars')}
              >
                Dollars
              </div>
              <div 
                style={{
                  padding: '12px 15px',
                  cursor: 'pointer'
                }}
                onClick={() => handleBuyInSelect('Shares')}
              >
                Shares
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#999', fontSize: '14px' }}>
          Amount
        </label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 15px',
          borderRadius: '4px',
          border: '1px solid #333',
          backgroundColor: '#2a2e33',
          marginBottom: '0'
        }}>
          <span style={{ marginRight: '5px' }}>{buyInType === 'Dollars' ? '$' : ''}</span>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              background: 'transparent',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>
        
        {/* No quick amount selection buttons */}
      </div>

      {/* Review Order Button */}
      <button 
        style={{
          width: '100%',
          padding: '15px',
          textAlign: 'center',
          backgroundColor: 'rgba(204, 247, 89, 1)',
          border: 'none',
          borderRadius: '30px',
          color: 'black',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
        onClick={handleReviewOrder}
      >
        Review Order
      </button>

      {/* Buying Power */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '15px 0',
        borderTop: '1px solid #333',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#999', marginLeft: '5px' }}>Orders satisfied with </span>
            <span style={{ color: 'rgba(204, 247, 89, 1)', fontWeight: 'bold' }}>Alpaca</span>
        </div>
        <span style={{ color: '#999', position: 'absolute', right: '0' }}>ⓘ</span>
      </div>
    </div>
  );
};

export default TradeCard;