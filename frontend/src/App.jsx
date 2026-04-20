import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import  '/public/iresidence1.png'

const API_URL = "http://127.0.0.1:8000/api";

function App() {
  const [apartments, setApartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Состояния модалок
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [newSale, setNewSale] = useState({
    client_name: '',
    block: 'A',
    floor: '',
    number: '',
    area: '',
    total_price: ''
  });

  const [paymentData, setPaymentData] = useState({
    apartmentId: '',
    amount: ''
  });

  // Загрузка данных
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
            client_name: client.name
          });
        });
      });
      setApartments(flatData);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Создание новой продажи
  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      // 1. Создаем клиента
      const clientRes = await axios.post(`${API_URL}/clients/`, {
        name: newSale.client_name
      });

      const clientId = clientRes.data.id;

      // 2. Создаем квартиру с привязкой к клиенту
      const apartmentData = {
        client: clientId,
        block: newSale.block,
        floor: parseInt(newSale.floor),
        number: String(newSale.number),
        area: parseFloat(newSale.area),
        total_price: parseFloat(newSale.total_price)
      };

      await axios.post(`${API_URL}/apartments/`, apartmentData);

      setShowSaleModal(false);
      setNewSale({ client_name: '', block: 'A', floor: '', number: '', area: '', total_price: '' });
      fetchData();
      alert("Продажа успешно зарегистрирована!");
    } catch (error) {
      console.error("Ошибка сохранения:", error.response?.data || error.message);
      alert("Ошибка: " + JSON.stringify(error.response?.data || "Ошибка сети"));
    }
  };

  // ИСПРАВЛЕННОЕ УДАЛЕНИЕ
  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить эту продажу?")) {
      try {
        // Убраны лишние слеши, вызывавшие 404
        await axios.delete(`${API_URL}/apartments/${id}/`);
        fetchData();
        alert("Запись удалена");
      } catch (error) {
        console.error("Ошибка удаления:", error);
        alert("Не удалось удалить запись. Проверьте консоль бэкенда.");
      }
    }
  };

  // Добавление платежа
  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/payments/`, {
        apartment: paymentData.apartmentId,
        amount: parseFloat(paymentData.amount)
      });
      setShowPaymentModal(false);
      setPaymentData({ apartmentId: '', amount: '' });
      fetchData();
    } catch (error) {
      alert("Ошибка при внесении платежа");
    }
  };

  const filteredApartments = apartments.filter(item =>
    item.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.number.toString().includes(searchQuery)
  );

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar shadow-sm mb-4">
        <div className="container-fluid px-4">
          <span className="navbar-brand h1 mb-0"><img className='logo' src='/public/iresidence1.png' alt="iResidence Logo" />iResidence</span>
        </div>
      </nav>

      <div className="container-fluid px-4">
        <div className="row mb-4">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Поиск по имени или номеру..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-md-4 text-end">
            <button className="btn shadow-sm w-100" onClick={() => setShowSaleModal(true)}>
              Новая продажа
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">Загрузка...</div>
        ) : (
          <div className="row g-4">
            {filteredApartments.map(apt => {
              const percent = Math.min(100, Math.round((apt.total_paid / apt.total_price) * 100)) || 0;
              return (
                <div key={apt.id} className="col-md-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <span className="badge bg-light text-dark">ID: {apt.id}</span>
                      <div>
                        <span className="text-primary fw-bold me-2">Блок {apt.block}</span>
                        {/* Кнопка удаления */}
                        <button 
                          className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => handleDelete(apt.id)}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{apt.client_name}</h5>
                      <p className="text-muted small">Кв. №{apt.number} | Этаж: {apt.floor} | {apt.area} м²</p>
                      
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-bold">${Number(apt.total_price).toLocaleString()}</span>
                        <span className="text-danger">-${Number(apt.remaining_balance).toLocaleString()}</span>
                      </div>
                      
                      <div className="progress mb-2" style={{height: '20px'}}>
                        <div className="progress-bar bg-success" style={{width: `${percent}%`}}>{percent}%</div>
                      </div>
                      <div className="text-end small text-muted">Оплачено: ${Number(apt.total_paid).toLocaleString()}</div>
                    </div>
                    <div className="card-footer bg-white border-0">
                      <button 
                        className="btn btn-outline-primary w-100"
                        onClick={() => {
                          setPaymentData({...paymentData, apartmentId: apt.id});
                          setShowPaymentModal(true);
                        }}
                      >
                        Внести платеж
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модалка Продажи */}
      {showSaleModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleAddSale}>
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Регистрация сделки</h5>
                <button type="button" className="btn-close" onClick={() => setShowSaleModal(false)}></button>
              </div>
              <div className="modal-body">
                <input type="text" className="form-control mb-2" placeholder="ФИО Клиента" required
                  value={newSale.client_name} onChange={e => setNewSale({...newSale, client_name: e.target.value})} />
                <div className="row g-2 mb-2">
                  <div className="col-4">
                    <select className="form-select" value={newSale.block} onChange={e => setNewSale({...newSale, block: e.target.value})}>
                      <option value="A">Блок A</option>
                      <option value="B">Блок B</option>
                    </select>
                  </div>
                  <div className="col-4">
                    <input type="number" className="form-control" placeholder="Этаж" required
                      value={newSale.floor} onChange={e => setNewSale({...newSale, floor: e.target.value})} />
                  </div>
                  <div className="col-4">
                    <input type="text" className="form-control" placeholder="№ Кв" required
                      value={newSale.number} onChange={e => setNewSale({...newSale, number: e.target.value})} />
                  </div>
                </div>
                <input type="number" step="0.1" className="form-control mb-2" placeholder="Площадь м2" required
                  value={newSale.area} onChange={e => setNewSale({...newSale, area: e.target.value})} />
                <input type="number" className="form-control" placeholder="Цена продажи ($)" required
                  value={newSale.total_price} onChange={e => setNewSale({...newSale, total_price: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success w-100">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка Оплаты */}
      {showPaymentModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleAddPayment}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Принять оплату</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="small text-muted mb-1">Сумма в долларах ($)</label>
                <input type="number" step="0.01" className="form-control" required autoFocus
                  value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary w-100">Подтвердить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;