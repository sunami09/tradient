// src/components/TradeCard.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import { auth, db } from '../firebase';                // your firebase init
import { doc, getDoc } from 'firebase/firestore';

type TabType    = 'buy' | 'sell';
type BuyInType  = 'Dollars' | 'Shares';
type OrderStatus = 'idle' | 'loading' | 'success' | 'error';

interface TradeCardProps {
  symbol?: string;
}

const TradeCard: React.FC<TradeCardProps> = ({ symbol = 'SPY' }) => {
  const [activeTab, setActiveTab]       = useState<TabType>('buy');
  const [buyInType, setBuyInType]       = useState<BuyInType>('Dollars');
  const [amount, setAmount]             = useState<string>('');
  const [orderStatus, setOrderStatus]   = useState<OrderStatus>('idle');
  const [error, setError]               = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);
  const [showBuyOrderDropdown, setShowBuyOrderDropdown] = useState(false);
  const [showBuyInDropdown, setShowBuyInDropdown]       = useState(false);
  const [showToast, setShowToast]       = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Clear any toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Reset button status after 2 seconds on success or error
  useEffect(() => {
    if (orderStatus === 'success' || orderStatus === 'error') {
      const timer = setTimeout(() => {
        setOrderStatus('idle');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [orderStatus]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
    setOrderStatus('idle');
  };

  const toggleBuyOrderDropdown = () => {
    setShowBuyOrderDropdown(!showBuyOrderDropdown);
  };

  const toggleBuyInDropdown = () => {
    setShowBuyInDropdown(!showBuyInDropdown);
  };

  const handleBuyInSelect = (type: BuyInType) => {
    setBuyInType(type);
    setShowBuyInDropdown(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleReviewOrder = async () => {
    // Reset previous states
    setError(null);
    setSuccessMsg(null);
    setOrderStatus('loading');

    // Validation checks
    const user = auth.currentUser;
    if (!user) {
      setError('You must be signed in to place an order.');
      setOrderStatus('error');
      displayToast('You must be signed in to place an order.');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.');
      setOrderStatus('error');
      displayToast('Please enter a valid amount.');
      return;
    }

    try {
      // 1) Fetch encrypted credentials from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User credentials not found.');
      }
      const { alpacaKey, alpacaSecret, alpacaEnv } = userDoc.data();

      // 2) Build payload for /trade
      const payload: any = {
        encryptedKey:   alpacaKey,
        encryptedSecret: alpacaSecret,
        env:            alpacaEnv,
        symbol,
        side:           activeTab,
        type:           'market',
        time_in_force:  'day'
      };

      // If buying/selling by dollar amount use `notional`, otherwise `qty`
      // Make sure to set qty explicitly to null when using notional
      if (buyInType === 'Dollars') {
        payload.notional = amt;
        payload.qty = null; // Explicitly set qty to null when using notional
      } else {
        payload.qty = amt;
        payload.notional = null; // Explicitly set notional to null when using qty
      }

      // 3) Call your Flask backend
      const res = await fetch(
        `${import.meta.env.VITE_PROXY_API_BASE_URL}/trade`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Order failed');
      }

      // 4) Success
      setOrderStatus('success');
      setSuccessMsg(`Order placed successfully`);
      setAmount('');
    } catch (err: any) {
      setOrderStatus('error');
      // Handle specific error messages from the API
      if (err.message && err.message.includes('account is not allowed to short')) {
        displayToast('Error: Account is not allowed to short');
      } else {
        displayToast(`Error: ${err.message || 'Unknown error'}`);
      }
      setError(err.message || 'Unknown error');
    }
  };

  // Helper to determine button style based on order status
  const getButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      padding: '15px',
      border: 'none',
      borderRadius: '30px',
      fontWeight: 'bold' as const,
      fontSize: '16px',
      cursor: orderStatus === 'loading' ? 'not-allowed' : 'pointer',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      position: 'relative',
      overflow: 'hidden'
    };

    // Status-specific styles
    if (orderStatus === 'success') {
      return { ...baseStyle, backgroundColor: 'rgba(204,247,89,1)', color: 'black' };
    } else if (orderStatus === 'error') {
      return { 
        ...baseStyle, 
        backgroundColor: 'rgba(204,247,89,1)', // Keep the base color
        color: 'white', // Text will be white for better contrast with the error overlay
      };
    } else { // idle or loading
      return { 
        ...baseStyle, 
        backgroundColor: 'rgba(204,247,89,1)', 
        color: 'black',
        opacity: orderStatus === 'loading' ? 0.6 : 1 
      };
    }
  };

  // Button content based on status
  const buttonContent = () => {
    if (orderStatus === 'loading') {
      return 'Placing…';
    } else if (orderStatus === 'success') {
      return (
        <>
          <span style={{ position: 'relative', zIndex: 2 }}>Order Placed</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2 }}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
          </svg>
        </>
      );
    } else if (orderStatus === 'error') {
      return (
        <>
          <span style={{ position: 'relative', zIndex: 2 }}>Failed</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2 }}>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
          </svg>
          {/* Error overlay with animation */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,99,71,0.8)',
            animation: 'fillFromCenter 0.3s ease-out forwards',
            transformOrigin: 'center center',
            zIndex: 1,
            borderRadius: '30px'
          }} />
        </>
      );
    } else {
      return activeTab === 'buy' ? 'Buy' : 'Sell';
    }
  };

  return (
    <div style={{
      backgroundColor: '#1E2124',
      borderRadius: '8px',
      padding: '23px 25px',
      maxWidth: '350px',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      position: 'relative'
    }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'center',
          animation: 'fadeInOut 3s ease-in-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #333',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        {(['buy','sell'] as TabType[]).map(tab => (
          <button
            key={tab}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              color: activeTab===tab ? 'rgba(204,247,89,1)' : '#999',
              borderBottom: activeTab===tab ? '2px solid rgba(204,247,89,1)' : 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => handleTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase()+tab.slice(1)} {symbol}
          </button>
        ))}
      </div>

      {/* Order Type (fixed here as market/day) */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color:'#999', fontSize:'14px' }}>Order type</label>
        <div style={{
          padding: '12px 15px',
          borderRadius: '4px',
          border: '1px solid #333',
          backgroundColor:'#2a2e33',
          marginTop:'8px'
        }}>
          Market / Day
        </div>
      </div>

      {/* Buy In */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color:'#999', fontSize:'14px' }}>Buy In</label>
        <div style={{ position:'relative', marginTop:'8px' }}>
          <div
            style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              padding:'12px 15px',
              border:'1px solid #333',
              borderRadius: showBuyInDropdown ? '4px 4px 0 0' : '4px',
              backgroundColor:'#2a2e33',
              cursor:'pointer'
            }}
            onClick={toggleBuyInDropdown}
          >
            <span>{buyInType}</span>
            <span style={{color:'#999'}}>▼</span>
          </div>
          {showBuyInDropdown && (
            <div style={{
              position:'absolute', top:'100%', left:0, right:0,
              backgroundColor:'#2a2e33', border:'1px solid #333',
              borderTop:'none', borderRadius:'0 0 4px 4px',
              zIndex:10
            }}>
              {(['Dollars','Shares'] as BuyInType[]).map(type => (
                <div
                  key={type}
                  style={{ padding:'12px 15px', cursor:'pointer', borderBottom:type==='Dollars'?'1px solid #333':'none' }}
                  onClick={() => handleBuyInSelect(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color:'#999', fontSize:'14px' }}>Amount</label>
        <div style={{
          display:'flex',
          alignItems:'center',
          padding:'0 15px',
          border:'1px solid #333',
          borderRadius:'4px',
          backgroundColor:'#2a2e33',
          marginTop:'8px'
        }}>
          {buyInType==='Dollars' && <span style={{marginRight:'5px'}}>$</span>}
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            style={{
              flex:1,
              padding:'12px 0',
              border:'none',
              background:'transparent',
              color:'white',
              fontSize:'16px',
              outline:'none'
            }}
          />
        </div>
      </div>

      {/* Review / Submit */}
      <button
        disabled={orderStatus === 'loading'}
        style={getButtonStyle()}
        onClick={handleReviewOrder}
      >
        {buttonContent()}
      </button>

      {/* Footer */}
      <div style={{
        display:'flex', justifyContent:'center', alignItems:'center',
        padding:'15px 0', borderTop:'1px solid #333', position:'relative'
      }}>
        <span style={{ color:'#999' }}>Orders via </span>
        <span style={{ color:'rgba(204,247,89,1)', fontWeight:'bold', marginLeft:'4px' }}>
          Alpaca
        </span>
      </div>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -10px); }
            10% { opacity: 1; transform: translate(-50%, 0); }
            90% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -10px); }
          }
          
          @keyframes fillFromCenter {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default TradeCard;