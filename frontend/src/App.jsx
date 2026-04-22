import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


const API_URL = "https://iresidence.onrender.com/api";

function App() {
  const [apartments, setApartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [newSale, setNewSale] = useState({
    client_name: '',
    block: 'A',
    floor: '',
    number: '',
    area: '',
    total_price: '',
    currency: 'USD'
  });

  const [paymentData, setPaymentData] = useState({
    apartmentId: '',
    amount: '',
    currency: 'USD',
    comment: ''
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
            client_name: client.name
          });
        });
      });
      setApartments(flatData);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      // Искусственная задержка, чтобы увидеть красивый лоадер
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ФУНКЦИЯ ГЕНЕРАЦИИ WORD
  const generateWord = () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Блок", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Клиент", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Кв №", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Площадь", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Цена", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Оплачено", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Долг", bold: true })] }),
        ],
      }),
    ];

    apartments.forEach((apt) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(apt.block)] }),
            new TableCell({ children: [new Paragraph(apt.client_name || "-")] }),
            new TableCell({ children: [new Paragraph(String(apt.number))] }),
            new TableCell({ children: [new Paragraph(`${apt.area} м²`)] }),
            new TableCell({ children: [new Paragraph(`${Number(apt.total_price).toLocaleString()}`)] }),
            new TableCell({ children: [new Paragraph(`${Number(apt.total_paid).toLocaleString()}`)] }),
            new TableCell({ children: [new Paragraph(`${Number(apt.remaining_balance).toLocaleString()}`)] }),
          ],
        })
      );
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "ОТЧЕТ ПО ПРОДАЖАМ IRESIDENCE", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: `Дата выгрузки: ${new Date().toLocaleDateString()}`, alignment: AlignmentType.RIGHT }),
          new Paragraph({ text: "" }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows }),
        ],
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "iResidence_Report.docx");
    });
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      const clientRes = await axios.post(`${API_URL}/clients/`, { name: newSale.client_name });
      const clientId = clientRes.data.id;
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
      setNewSale({ client_name: '', block: 'A', floor: '', number: '', area: '', total_price: '', currency: 'USD' });
      fetchData();
    } catch (error) {
      alert("Ошибка при сохранении");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить эту продажу?")) {
      try {
        await axios.delete(`${API_URL}/apartments/${id}/`);
        fetchData();
      } catch (error) {
        alert("Ошибка удаления");
      }
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/payments/`, {
        apartment: paymentData.apartmentId,
        amount: parseFloat(paymentData.amount),
        note: paymentData.comment
      });
      setShowPaymentModal(false);
      setPaymentData({ apartmentId: '', amount: '', currency: 'USD', comment: '' });
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
    <div className="min-vh-100 bg-white m-0 p-0">
      <nav className="navbar border-0 p-0 mb-4" style={{ backgroundColor: '#C5A059', width: '100%' }}>
        <div className="container-fluid d-flex justify-content-center py-3">
          <span className="navbar-brand h1 mb-0 d-flex align-items-center text-white border-0">
            <img className='logo-img' src='/iresidence1.png' alt="Logo"  />
            <h3 className="m-0 fw-bold">iResidence</h3>
          </span>
        </div>
      </nav>

      <div className="container-fluid px-4">
        <div className="row mb-4 g-3">
          <div className="col-md-8">
            <input type="text" className="form-control border-0 shadow-sm py-2" placeholder="Поиск по имени или номеру..."
              onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="col-md-4">
            <button className="btn shadow-sm w-100 py-2 border-0" style={{backgroundColor: '#C5A059', color: 'white'}}
                    onClick={() => setShowSaleModal(true)}> НОВАЯ ПРОДАЖА </button>
          </div>
        </div>

        {loading ? (
          <div className="loader-container text-center py-5">
            <img src='/iresidence.png' alt="Loading..." className="spinning-logo" style={{ width: '200px' }} />
            
          </div>
        ) : (
          <>
            <h3 className="mb-3 fw-bold px-2" style={{color: '#C5A059'}}>Блок А</h3>
            <div className="row g-4 mb-5">
              {filteredApartments.filter(a => a.block === 'A').map(apt => (
                <ApartmentCard key={apt.id} apt={apt} onDelete={handleDelete} onPayment={(id) => {
                  setPaymentData({...paymentData, apartmentId: id});
                  setShowPaymentModal(true);
                }} />
              ))}
            </div>

            <h3 className="mb-3 fw-bold px-2" style={{color: '#C5A059'}}>Блок Б</h3>
            <div className="row g-4 mb-5">
              {filteredApartments.filter(a => a.block === 'B').map(apt => (
                <ApartmentCard key={apt.id} apt={apt} onDelete={handleDelete} onPayment={(id) => {
                  setPaymentData({...paymentData, apartmentId: id});
                  setShowPaymentModal(true);
                }} />
              ))}
            </div>

            <div className="text-center pb-5 mt-4">
              <button className="btn btn-lg shadow-lg px-5 py-3" 
                      style={{backgroundColor: '#2b5797', color: 'white', borderRadius: '50px'}}
                      onClick={generateWord}>
                <i className="bi bi-file-earmark-word"></i> СКАЧАТЬ ВЕСЬ ОТЧЕТ (WORD)
              </button>
            </div>
          </>
        )}
      </div>

      {/* Модалки (Продажа и Оплата) */}
      {/* ... Код модалок остается прежним (см. предыдущий фрагмент) ... */}
    </div>
  );
}

function ApartmentCard({ apt, onDelete, onPayment }) {
  const rawPercent = (apt.total_paid / apt.total_price) * 100;
  const percent = apt.remaining_balance <= 0 ? 100 : Math.floor(rawPercent);
  const isSum = apt.total_price > 1000000;
  const currency = isSum ? ' сум' : ' $';
  const prefix = isSum ? '' : '$';

  return (
    <div className="col-md-4">
      <div className="card border-0 shadow-sm h-100" style={{borderRadius: '15px'}}>
        <div className="card-header bg-white border-0 d-flex justify-content-end pt-3">
          <button className="btn btn-sm text-danger border-0" onClick={() => onDelete(apt.id)}>&times;</button>
        </div>
        <div className="card-body text-center">
          <h5 className="card-title fw-bold" style={{color: '#444'}}>{apt.client_name || "Без имени"}</h5>
          <p className="text-muted small">Кв. №{apt.number} | Этаж: {apt.floor} | {apt.area} м²</p>
          <div className="d-flex justify-content-between mb-1 px-2">
            <span className="fw-bold">{prefix}{Number(apt.total_price).toLocaleString()}{isSum && currency}</span>
            <span className="text-danger">-{prefix}{Number(apt.remaining_balance).toLocaleString()}{isSum && currency}</span>
          </div>
          <div className="progress mb-2 mx-2" style={{height: '12px', borderRadius: '10px'}}>
            <div className={`progress-bar ${percent === 100 ? 'bg-success' : 'bg-info'}`} style={{width: `${percent}%`}}></div>
          </div>
          <div className="d-flex justify-content-between px-2 small text-muted">
            <span className={`badge ${percent === 100 ? 'bg-success' : 'bg-info'}`}>{percent}%</span>
            <span>Оплачено: {prefix}{Number(apt.total_paid).toLocaleString()}{isSum && currency}</span>
          </div>
          {apt.last_payment_note && (
            <div className="mt-3 p-2 bg-light small text-muted fst-italic" style={{borderRadius: '10px', fontSize: '0.8rem'}}>
              <strong>Заметка:</strong> {apt.last_payment_note}
            </div>
          )}
        </div>
        <div className="card-footer bg-white border-0 pb-4">
          <button className="btn btn-outline-warning w-100 border-1 py-2"
            style={{borderColor: '#C5A059', color: '#C5A059', borderRadius: '10px'}}
            onClick={() => onPayment(apt.id)}> ВНЕСТИ ПЛАТЕЖ </button>
        </div>
      </div>
    </div>
  );
}

export default App;