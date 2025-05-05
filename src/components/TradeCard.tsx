// src/components/TradeCard.tsx
import React, { useState } from 'react';
import { auth, db } from '../firebase';                // your firebase init
import { doc, getDoc } from 'firebase/firestore';

type TabType    = 'buy' | 'sell';
type BuyInType  = 'Dollars' | 'Shares';

interface TradeCardProps {
  symbol?: string;
}

const TradeCard: React.FC<TradeCardProps> = ({ symbol = 'SPY' }) => {
  const [activeTab, setActiveTab]       = useState<TabType>('buy');
  const [buyInType, setBuyInType]       = useState<BuyInType>('Dollars');
  const [amount, setAmount]             = useState<string>('');
  const [loading, setLoading]           = useState<boolean>(false);
  const [error, setError]               = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);
  const [showBuyOrderDropdown, setShowBuyOrderDropdown] = useState(false);
  const [showBuyInDropdown, setShowBuyInDropdown]       = useState(false);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
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

  const handleReviewOrder = async () => {
    setError(null);
    setSuccessMsg(null);

    const user = auth.currentUser;
    if (!user) {
      setError('You must be signed in to place an order.');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
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
      if (buyInType === 'Dollars') {
        payload.notional = amt;
      } else {
        payload.qty = amt;
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
      setSuccessMsg(`Order placed! ID: ${json.order.id}`);
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#1E2124',
      borderRadius: '8px',
      padding: '23px 25px',
      maxWidth: '350px',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
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

      {/* Errors / Success */}
      {error && (
        <div style={{ color:'tomato', marginBottom:'10px' }}>{error}</div>
      )}
      {successMsg && (
        <div style={{ color:'lightgreen', marginBottom:'10px' }}>{successMsg}</div>
      )}

      {/* Review / Submit */}
      <button
        disabled={loading}
        style={{
          width:'100%',
          padding:'15px',
          backgroundColor:'rgba(204,247,89,1)',
          border:'none',
          borderRadius:'30px',
          color:'black',
          fontWeight:'bold',
          fontSize:'16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom:'20px',
          opacity: loading ? 0.6 : 1
        }}
        onClick={handleReviewOrder}
      >
        {loading ? 'Placing…' : (activeTab==='buy' ? 'Buy' : 'Sell')}
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
    </div>
  );
};

export default TradeCard;
