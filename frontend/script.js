const API_BASE = 'http://localhost:8000/api';

// Helper: fetch with auth header
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {...headers, ...options.headers }
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
}

// Logout function
function setupLogout() {
    const logoutLinks = document.querySelectorAll('.dropdown-item.logout');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        });
    });
}

// Update user info in top bar
function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        if (el.id === 'employeeNameDisplay') {
            el.textContent = user.name;
        } else {
            el.textContent = user.role === 'admin' ? 'Admin User' : user.name;
        }
    });

    const avatarIcons = document.querySelectorAll('.user-avatar i');
    avatarIcons.forEach(icon => {
        icon.className = user.role === 'admin' ? 'fas fa-user-shield' : 'fas fa-user-tie';
    });

    // Employee details on request page (without optional chaining)
    const empDetails = document.querySelectorAll('.employee-details p strong');
    if (empDetails.length) {
        empDetails[0].parentElement.innerHTML = `<strong>Employee Name:</strong> ${user.name}`;
        const empIdElement = document.querySelector('.employee-details p:nth-child(2) strong');
        if (empIdElement && empIdElement.parentElement) {
            empIdElement.parentElement.innerHTML = `<strong>Employee ID:</strong> ${user.employeeId}`;
        }
        const deptElement = document.querySelector('.employee-details p:nth-child(3) strong');
        if (deptElement && deptElement.parentElement) {
            deptElement.parentElement.innerHTML = `<strong>Department:</strong> ${user.department || 'Engineering'}`;
        }
    }
}

// Load admin dashboard data
async function loadAdminDashboard() {
    if (!document.querySelector('.admin-page')) return;

    // Stats
    try {
        const stats = await apiFetch('/dashboard/admin/stats');
        const statCards = document.querySelectorAll('.stat-card h2');
        if (statCards.length >= 6) {
            statCards[0].textContent = stats.total;
            statCards[1].textContent = stats.pending;
            statCards[2].textContent = stats.approvedNotCollected;
            statCards[3].textContent = stats.inProgress;
            statCards[4].textContent = stats.closed;
            statCards[5].textContent = stats.cancelled;
        }
        document.querySelector('.badge').textContent = `${stats.pending} pending`;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }

    // Request Inbox
    try {
        const tickets = await apiFetch('/tickets');
        const tbody = document.getElementById('requestInboxBody');
        if (tbody) {
            tbody.innerHTML = '';
            tickets.forEach(ticket => {
                const row = document.createElement('tr');
                const statusClass = ticket.status.toLowerCase().replace(/[ –]/g, '-');
                let actions = '';
                if (ticket.status === 'Pending') {
                    actions = `
                        <button class="btn-success" data-id="${ticket.id}" data-action="approve"><i class="fas fa-check"></i> Approve</button>
                        <button class="btn-danger" data-id="${ticket.id}" data-action="reject"><i class="fas fa-times"></i> Reject</button>
                    `;
                } else if (ticket.status === 'Approved – Not Collected') {
                    actions = `
                        <button class="btn-primary" data-id="${ticket.id}" data-action="collect"><i class="fas fa-check-circle"></i> Mark as Collected</button>
                        <button class="btn-danger" data-id="${ticket.id}" data-action="cancel"><i class="fas fa-times"></i> Cancel</button>
                    `;
                } else {
                    actions = `<button class="btn-icon"><i class="fas fa-eye"></i></button>`;
                }
                row.innerHTML = `
                    <td>${ticket.ticket_id}</td>
                    <td>${ticket.employee_name}</td>
                    <td>${ticket.asset_type_requested}</td>
                    <td>${ticket.purpose.substring(0, 30)}...</td>
                    <td>${new Date(ticket.request_date).toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
                    <td class="actions">${actions}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Failed to load tickets:', error);
    }

    // Awaiting Collection
    try {
        const tickets = await apiFetch('/tickets');
        const awaiting = tickets.filter(t => t.status === 'Approved – Not Collected');
        const tbody = document.getElementById('awaitingCollectionBody');
        if (tbody) {
            tbody.innerHTML = '';
            awaiting.forEach(ticket => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ticket.ticket_id}</td>
                    <td>${ticket.employee_name}</td>
                    <td>${ticket.asset_type_requested}</td>
                    <td>${ticket.purpose.substring(0, 30)}...</td>
                    <td>${ticket.expected_return_date}</td>
                    <td class="actions">
                        <button class="btn-primary" data-id="${ticket.id}" data-action="collect"><i class="fas fa-check-circle"></i> Mark as Collected</button>
                        <button class="btn-danger" data-id="${ticket.id}" data-action="cancel"><i class="fas fa-times"></i> Cancel</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Failed to load awaiting collection:', error);
    }

    // Return & Closure
    try {
        const tickets = await apiFetch('/tickets');
        const inProgress = tickets.filter(t => t.status === 'In Progress');
        const tbody = document.getElementById('returnClosureBody');
        if (tbody) {
            tbody.innerHTML = '';
            inProgress.forEach(ticket => {
                const row = document.createElement('tr');
                const today = new Date();
                const expected = new Date(ticket.expected_return_date);
                let statusClass = 'in-use';
                let statusText = 'In Use';
                if (expected < today) {
                    statusClass = 'overdue';
                    statusText = 'Overdue';
                } else {
                    const diffDays = Math.ceil((expected - today) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 7) {
                        statusClass = 'due-soon';
                        statusText = 'Due Soon';
                    }
                }
                row.innerHTML = `
                    <td>${ticket.ticket_id}</td>
                    <td>${ticket.employee_name}</td>
                    <td>${ticket.asset_type_requested} (Asset ID: ${ticket.approved_asset_code || 'N/A'})</td>
                    <td>${ticket.expected_return_date}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="actions">
                        <button class="btn-primary" data-id="${ticket.id}" data-action="return"><i class="fas fa-undo"></i> Mark as Returned</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Failed to load returns:', error);
    }

    // Asset Inventory
    try {
        const assets = await apiFetch('/assets');
        const tbody = document.getElementById('assetInventoryBody');
        if (tbody) {
            tbody.innerHTML = '';
            assets.forEach(asset => {
                const row = document.createElement('tr');
                const statusClass = asset.status.toLowerCase().replace(' ', '-');
                let statusIcon = 'fa-check-circle';
                if (asset.status === 'In Use') statusIcon = 'fa-times-circle';
                else if (asset.status === 'Maintenance') statusIcon = 'fa-wrench';
                else if (asset.status === 'Reserved') statusIcon = 'fa-clock';
                row.innerHTML = `
                    <td>${asset.asset_id}</td>
                    <td>${asset.asset_type}</td>
                    <td>${asset.serial_number}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${asset.status}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-icon edit-asset" data-id="${asset.id}"><i class="fas fa-edit"></i> Edit</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Failed to load assets:', error);
    }
}

// Load employee dashboard data
async function loadEmployeeDashboard() {
    if (!document.querySelector('.employee-page')) return;

    try {
        const tickets = await apiFetch('/tickets');
        const tbody = document.getElementById('myTicketsBody');
        if (tbody) {
            tbody.innerHTML = '';
            tickets.forEach(ticket => {
                const row = document.createElement('tr');
                const statusClass = ticket.status.toLowerCase().replace(/[ –]/g, '-');
                row.innerHTML = `
                    <td>${ticket.ticket_id}</td>
                    <td>${ticket.asset_type_requested}</td>
                    <td>${new Date(ticket.request_date).toLocaleString()}</td>
                    <td>${ticket.expected_return_date}</td>
                    <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
                `;
                tbody.appendChild(row);
            });
            const statCircle = document.querySelector('.stat-circle h2');
            if (statCircle) statCircle.textContent = tickets.length;
        }
    } catch (error) {
        console.error('Failed to load employee tickets:', error);
    }
}

// Handle actions (approve, reject, collect, cancel, return)
document.addEventListener('click', async function(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    e.preventDefault();

    try {
        if (action === 'approve') {
            await apiFetch(`/tickets/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'Approved – Not Collected' })
            });
            alert('Ticket approved');
            location.reload();
        } else if (action === 'reject') {
            const reason = prompt('Please enter reason for rejection:');
            if (reason === null) return;
            if (!reason.trim()) {
                alert('Reason is required');
                return;
            }
            await apiFetch(`/tickets/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'Cancelled', reason: reason.trim() })
            });
            alert('Ticket rejected');
            location.reload();
        } else if (action === 'collect') {
            const tickets = await apiFetch('/tickets');
            const ticket = tickets.find(t => t.id == id);
            if (!ticket) return;
            const assetId = prompt(`Enter Asset ID to hand over for ticket ${ticket.ticket_id}:`);
            if (!assetId) return;
            await apiFetch('/tickets/handover', {
                method: 'POST',
                body: JSON.stringify({
                    ticketId: id,
                    assetId: assetId,
                    employeeId: ticket.user_id
                })
            });
            alert('Handover completed');
            location.reload();
        } else if (action === 'cancel') {
            if (!confirm('Cancel collection?')) return;
            await apiFetch(`/tickets/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'Cancelled' })
            });
            alert('Collection cancelled');
            location.reload();
        } else if (action === 'return') {
            if (!confirm('Mark as returned?')) return;
            const tickets = await apiFetch('/tickets');
            const ticket = tickets.find(t => t.id == id);
            if (!ticket) return;
            await apiFetch('/tickets/return', {
                method: 'POST',
                body: JSON.stringify({
                    ticketId: id,
                    assetId: ticket.approved_asset_id,
                    conditionNotes: 'Returned in good condition'
                })
            });
            alert('Asset returned');
            location.reload();
        }
    } catch (error) {
        alert(error.message);
    }
});

// Add Asset (simplified prompt-based)
document.addEventListener('click', function(e) {
    const addBtn = e.target.closest('.btn-primary');
    if (addBtn && addBtn.textContent.includes('Add Asset') && addBtn.closest('.section-actions')) {
        e.preventDefault();
        showAddAssetModal();
    }
});

function showAddAssetModal() {
    const assetType = prompt('Asset Type (e.g., Laptop):');
    if (!assetType) return;
    const serialNumber = prompt('Serial Number:');
    if (!serialNumber) return;
    const status = prompt('Status (Available, In Use, Maintenance, Reserved):', 'Available');
    const location = prompt('Location:');
    const purchaseDate = prompt('Purchase Date (YYYY-MM-DD):');
    const notes = prompt('Notes:');

    (async() => {
        try {
            await apiFetch('/assets', {
                method: 'POST',
                body: JSON.stringify({ assetType, serialNumber, status, location, purchaseDate, notes })
            });
            alert('Asset added');
            location.reload();
        } catch (error) {
            alert(error.message);
        }
    })();
}

// Edit Asset (simplified)
document.addEventListener('click', function(e) {
    const editBtn = e.target.closest('.edit-asset');
    if (!editBtn) return;
    e.preventDefault();
    const assetId = editBtn.dataset.id;
    if (!assetId) return;
    (async() => {
        try {
            const assets = await apiFetch('/assets');
            const asset = assets.find(a => a.id == assetId);
            if (!asset) return;
            const newSerial = prompt('Serial Number:', asset.serial_number);
            if (!newSerial) return;
            const newStatus = prompt('Status (Available, In Use, Maintenance, Reserved):', asset.status);
            const newLocation = prompt('Location:', asset.location);
            await apiFetch(`/assets/${assetId}`, {
                method: 'PUT',
                body: JSON.stringify({ serialNumber: newSerial, status: newStatus, location: newLocation, notes: '' })
            });
            alert('Asset updated');
            location.reload();
        } catch (error) {
            alert(error.message);
        }
    })();
});

// Request asset form submission
const requestForm = document.querySelector('.request-form');
if (requestForm) {
    requestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const assetType = document.getElementById('assetType').value;
        const purpose = document.getElementById('purpose').value;
        const expectedReturn = document.getElementById('expectedReturn').value;
        if (!assetType || !purpose || !expectedReturn) {
            alert('Please fill all fields');
            return;
        }
        try {
            await apiFetch('/tickets', {
                method: 'POST',
                body: JSON.stringify({
                    assetType,
                    purpose,
                    expectedReturnDate: expectedReturn
                })
            });
            alert('Request submitted');
            window.location.href = 'employee-dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 60000);
    updateUserInfo();
    setupLogout();

    if (document.querySelector('.admin-page')) {
        loadAdminDashboard();
    } else if (document.querySelector('.employee-page')) {
        loadEmployeeDashboard();
    }
});

// DateTime update
function updateDateTime() {
    const now = new Date();
    const dateElements = document.querySelectorAll('.date');
    const timeElements = document.querySelectorAll('.time');
    if (dateElements.length) {
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        dateElements.forEach(el => el.textContent = dateStr);
    }
    if (timeElements.length) {
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        timeElements.forEach(el => el.textContent = timeStr);
    }
}