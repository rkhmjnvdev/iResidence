import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const API_URL = "https://iresidence.onrender.com/api";

function App() {
  const [apartments, setApartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  
  // ДОБАВЛЕНО: contract_price
  const [newSale, setNewSale] = useState({
    client_name: '', phone: '', passport: '', block: 'A', floor: '', number: '', area: '', total_price: '', contract_price: '', currency: 'USD'
  });

  const [paymentData, setPaymentData] = useState({
    apartmentId: '', amount: '', currency: 'USD', comment: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients/`);
      const flatData = [];
      response.data.forEach(client => {
        client.apartments.forEach(apt => {
          flatData.push({
            ...apt,
            client_id: client.id,
            client_name: client.name,
            client_phone: client.phone || "Не указан",
            client_passport: client.passport || "Не указан",
            payment_history: apt.payments || [] 
          });
        });
      });
      setApartments(flatData);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      const clientRes = await axios.post(`${API_URL}/clients/`, { 
        name: newSale.client_name,
        phone: newSale.phone,
        passport: newSale.passport
      });
      await axios.post(`${API_URL}/apartments/`, {
        client: clientRes.data.id,
        block: newSale.block,
        floor: parseInt(newSale.floor),
        number: String(newSale.number),
        area: parseFloat(newSale.area),
        total_price: parseFloat(newSale.total_price),
        contract_price: parseFloat(newSale.contract_price), // ДОБАВЛЕНО: Отправка на бэкенд
        currency: newSale.currency
      });
      setShowSaleModal(false);
      // ДОБАВЛЕНО: Сброс contract_price
      setNewSale({ client_name: '', phone: '', passport: '', block: 'A', floor: '', number: '', area: '', total_price: '', contract_price: '', currency: 'USD' });
      fetchData();
    } catch (error) { alert("Ошибка при сохранении"); }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/payments/`, {
        apartment: paymentData.apartmentId,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        note: paymentData.comment
      });
      setShowPaymentModal(false);
      setPaymentData({ apartmentId: '', amount: '', currency: 'USD', comment: '' });
      fetchData();
    } catch (error) { alert("Ошибка при внесении платежа"); }
  };

  const openDetails = (apt) => {
    setSelectedApartment(apt);
    setShowDetailModal(true);
  };

  const filteredApartments = apartments.filter(a => 
    a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-vh-100 bg-white m-0 p-0">
      <nav className="navbar border-0 p-0 mb-4" style={{ backgroundColor: '#C5A059', width: '100%' }}>
        <div className="container-fluid d-flex justify-content-center py-3">
          <span className="navbar-brand h1 mb-0 d-flex align-items-center text-white border-0">
            <img className='logo-img' src='/iresidence1.png' alt="Logo" />
            <h3 className="m-0 fw-bold ms-3">iResidence</h3>
          </span>
        </div>
      </nav>

      <div className="container-fluid px-4">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <img src='/iresidence.png' alt="Loading..." className="spinning-logo" style={{ width: '150px', marginBottom: '20px' }} />
            <h4 className="fw-bold" >Загрузка данных...</h4>
          </div>
        ) : (
          <>
            <div className="row mb-4 g-3">
              <div className="col-md-8">
                <input type="text" className="form-control border-0 shadow-sm py-2" placeholder="Поиск клиента или № квартиры..."
                  onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="col-md-4">
                <button className="btn shadow-sm w-100 py-2 border-0 text-white" style={{backgroundColor: '#C5A059'}}
                        onClick={() => setShowSaleModal(true)}> НОВАЯ ПРОДАЖА </button>
              </div>
            </div>

            <div className="row g-4">
              {filteredApartments.map(apt => (
                <ApartmentCard 
                  key={apt.id} 
                  apt={apt} 
                  onPayment={(e, id) => {
                    e.stopPropagation();
                    setPaymentData({...paymentData, apartmentId: id, currency: apt.currency || 'USD'});
                    setShowPaymentModal(true);
                  }}
                  onClick={() => openDetails(apt)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* МОДАЛКА: ДЕТАЛИ */}
      {showDetailModal && selectedApartment && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header text-white" style={{backgroundColor: '#C5A059'}}>
                <h5 className="modal-title fw-bold">Информация о клиенте</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p className='mb-1 text-muted small'>ФИО Клиента</p>
                    <h5 className='fw-bold'>{selectedApartment.client_name}</h5>
                    <p className='mb-1 text-muted small mt-3'>Телефон</p>
                    <p className='fw-bold'>{selectedApartment.client_phone}</p>
                  </div>
                  <div className="col-md-6">
                    <p className='mb-1 text-muted small'>Паспортные данные</p>
                    <p className='fw-bold'>{selectedApartment.client_passport}</p>
                    <p className='mb-1 text-muted small mt-3'>Объект</p>
                    <p className='fw-bold'>Блок {selectedApartment.block}, Кв №{selectedApartment.number}, Этаж {selectedApartment.floor}</p>
                  </div>
                </div>
                <hr />
                <h6 className="fw-bold mb-3" style={{color: '#C5A059'}}>История платежей</h6>
                <div className="table-responsive">
                    <table className="table table-sm table-hover">
                        <thead className="table-light">
                            <tr><th>Дата</th><th>Сумма</th><th>Заметка</th></tr>
                        </thead>
                        <tbody>
                            {selectedApartment.payment_history.length > 0 ? (
                                selectedApartment.payment_history.map((p, i) => {
                                    const isUzsPay = p.currency === 'UZS';
                                    return (
                                        <tr key={i}>
                                            <td>{new Date(p.created_at || p.date).toLocaleDateString()}</td>
                                            <td className="fw-bold text-success">
                                                {isUzsPay ? '' : '$ '}{Number(p.amount).toLocaleString()}{isUzsPay ? ' сум' : ''}
                                            </td>
                                            <td className="small text-muted">{p.note || "-"}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="3" className="text-center text-muted py-3">Платежей еще не было</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА: НОВАЯ ПРОДАЖА */}
      {showSaleModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content border-0">
              <div className="modal-header text-white" style={{backgroundColor: '#C5A059'}}>
                <h5 className="modal-title fw-bold">Регистрация продажи</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSaleModal(false)}></button>
              </div>
              <form onSubmit={handleAddSale}>
                <div className="modal-body">
                  <input type="text" className="form-control mb-2" placeholder="ФИО Клиента" required
                    onChange={e => setNewSale({...newSale, client_name: e.target.value})} />
                  <div className="row g-2 mb-2">
                    <div className="col"><input type="text" className="form-control" placeholder="Телефон" onChange={e => setNewSale({...newSale, phone: e.target.value})} /></div>
                    <div className="col"><input type="text" className="form-control" placeholder="Паспорт" onChange={e => setNewSale({...newSale, passport: e.target.value})} /></div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col">
                      <select className="form-select" onChange={e => setNewSale({...newSale, block: e.target.value})}>
                        <option value="A">Блок А</option>
                        <option value="B">Блок Б</option>
                      </select>
                    </div>
                    <div className="col"><input type="number" className="form-control" placeholder="Этаж" required onChange={e => setNewSale({...newSale, floor: e.target.value})} /></div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col"><input type="text" className="form-control" placeholder="№ Кв" required onChange={e => setNewSale({...newSale, number: e.target.value})} /></div>
                    <div className="col"><input type="number" step="0.01" className="form-control" placeholder="кв" required onChange={e => setNewSale({...newSale, area: e.target.value})} /></div>
                  </div>
                  <div className="input-group mb-2">
                    <input type="number" className="form-control" placeholder="Цена" required onChange={e => setNewSale({...newSale, total_price: e.target.value})} />
                    
                    {/* ДОБАВЛЕНО: Инпут "Сумма договора" внедрен в уже существующую структуру, без изменения классов */}
                    <input type="number" className="form-control" placeholder="Сумма договора" required onChange={e => setNewSale({...newSale, contract_price: e.target.value})} />
                    
                    <select className="form-select" style={{maxWidth: '100px'}} onChange={e => setNewSale({...newSale, currency: e.target.value})}>
                      <option value="USD">USD</option>
                      <option value="UZS">UZS</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="submit" className="btn text-white w-100" style={{backgroundColor: '#C5A059'}}>СОХРАНИТЬ</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ПЛАТЕЖ */}
      {showPaymentModal && (
        <div className="modal show d-block" >
          <div className="modal-dialog">
            <div className="modal-content border-0">
              <div className="modal-header text-white" style={{backgroundColor: '#C5A059'}}>
                <h5 className="modal-title fw-bold">Внести оплату</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <form onSubmit={handleAddPayment}>
                <div className="modal-body">
                  <div className="input-group mb-3">
                    <input type="number" className="form-control" placeholder="Сумма" required onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
                    <select className="form-select" style={{maxWidth: '100px'}} value={paymentData.currency} onChange={e => setPaymentData({...paymentData, currency: e.target.value})}>
                      <option value="USD">USD</option>
                      <option value="UZS">UZS</option>
                    </select>
                  </div>
                  <textarea className="form-control" rows="3" placeholder="Заметка" onChange={e => setPaymentData({...paymentData, comment: e.target.value})}></textarea>
                </div>
                <div className="modal-footer border-0">
                  <button type="submit" className="btn text-white w-100" style={{backgroundColor: '#C5A059'}}>ПОДТВЕРДИТЬ ПЛАТЕЖ</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApartmentCard({ apt, onPayment, onClick }) {
  const percent = Math.floor((apt.total_paid / apt.total_price) * 100) || 0;
  
  // ЛОГИКА ВАЛЮТЫ: СТРОГО ПО ЗНАЧЕНИЮ ИЗ БАЗЫ
  const isUZS = apt.currency === 'UZS';
  const prefix = isUZS ? "" : "$ ";
  const suffix = isUZS ? " сум" : "";

  return (
    <div className="col-md-4" onClick={onClick} style={{cursor: 'pointer'}}>
      <div className="card border-0 shadow-sm h-100 card-hover" style={{borderRadius: '15px', transition: '0.3s'}}>
        <div className="card-body text-center">
          <h5 className="card-title fw-bold" style={{color: '#444'}}>{apt.client_name || "Без имени"}</h5>
          <p className="text-muted small">Кв. №{apt.number} | {apt.area} м²</p>
          <div className="d-flex justify-content-between mb-1 px-2 fw-bold small">
            <span>{prefix}{Number(apt.total_price).toLocaleString()}{suffix}</span>
            <span className="text-danger">-{prefix}{Number(apt.remaining_balance).toLocaleString()}{suffix}</span>
          </div>
          <div className="progress mb-2 mx-2" style={{height: '10px', borderRadius: '10px'}}>
            <div className={`progress-bar ${percent === 100 ? 'bg-success' : 'bg-info'}`} style={{width: `${percent}%`}}></div>
          </div>
          <div className="d-flex justify-content-between px-2 small text-muted mb-3">
            <span className={`badge ${percent === 100 ? 'bg-success' : 'bg-info'}`}>{percent}%</span>
            <span>Оплачено: {prefix}{Number(apt.total_paid).toLocaleString()}{suffix}</span>
          </div>
          <button className="btn btn-outline-warnin w-100 border-1 py-2"
            style={{borderColor: '#C5A059', color: '#C5A059', borderRadius: '10px', fontWeight: 'bold'}}
            onClick={(e) => onPayment(e, apt.id)}> ВНЕСТИ ПЛАТЕЖ </button>
        </div>
      </div>
    </div>
  );
}

export default App;