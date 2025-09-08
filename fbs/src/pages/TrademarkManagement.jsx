import React, { useEffect, useState } from 'react';



export function TrademarkForm({ onClose, editing }){
const API = process.env.REACT_APP_API || 'http://localhost:5000/api';
const [state, setState] = useState(() => editing ? { ...editing } : {
trademarkName: '', applicationNo: '', class: '', applicantName: '', filingDate: '', status: 'Filed', nextAction: '', deadline: '', responsiblePerson: '', remarks: ''
});


async function save(e){
e.preventDefault();
const method = editing ? 'PUT' : 'POST';
const url = editing ? `${API}/trademarks/${editing._id}` : `${API}/trademarks`;
await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
onClose();
}


return (
<div style={{ padding: 12, border: '1px solid #ccc', marginBottom: 12 }}>
<form onSubmit={save}>
<div>
<label>Name</label><br/>
<input value={state.trademarkName} onChange={e=>setState({...state, trademarkName: e.target.value})} required />
</div>
<div>
<label>Application No.</label><br/>
<input value={state.applicationNo} onChange={e=>setState({...state, applicationNo: e.target.value})} required />
</div>
<div>
<label>Class</label><br/>
<input value={state.class} onChange={e=>setState({...state, class: e.target.value})} />
</div>
<div style={{ marginTop: 8 }}>
<button type="submit">Save</button>
<button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
</div>
</form>
</div>
);
}