async function loadInventory() {
    console.log("Loading Inventory...");
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center; padding: 2rem;">Loading inventory...</td></tr>';
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            window.location.href='login.html';
            return;
        }
        const { data, error } = await window.supabaseClient
            .from('inventory')
            .select('*')
            .eq('user_id', user.id)
            .order('item_name', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
            tbody.innerHTML='<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #888;">No items in inventory. <br><br> <button class="action-btn-pill" onclick="openAddInventoryModal()">+ Add Your First Item</button></td></tr>';
            updateCostSummary([]);
            return;
        }
        tbody.innerHTML='';
        let totalCost = 0;
        data.forEach(item => {
            const isLowStock = item.quantity <= (item.low_stock_limit || 0);
            const totalItemValue = item.quantity * item.cost_per_unit;
            totalCost += totalItemValue;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="font-weight:bold; color: var(--text-color);">${item.item_name}</div>
                    ${isLowStock ? '<span style="font-size:0.7rem; background:#ff4444; color:white; padding:2px 6px; border-radius:4px; margin-top:4px; display:inline-block;">LOW STOCK</span>' : ''}
                </td>
                <td><span class="badge-category">${item.category || 'General'}</span></td>
                <td>
                    <div style="font-weight:bold; ${isLowStock ? 'color:#ff4444;' : ''}">${item.quantity} ${item.unit}</div>
                </td>
                <td>₹${item.cost_per_unit}</td>
                <td>₹${totalItemValue.toLocaleString('en-IN')}</td>
                <td>
                    <button class="action-icon" onclick="editInventory('${item.id}')" title="Edit" style="background:none; border:none; color:var(--accent-color); cursor:pointer; font-size:1rem; padding: 5px;"><i class="fas fa-edit"></i></button>
                    <button class="action-icon" onclick="deleteInventory('${item.id}')" title="Delete" style="background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:1rem; padding: 5px;"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
            if (isLowStock) {
                console.log(`[ALERT] Low stock detected for ${item.item_name}. Sending email notification...`);
            }
        });
        updateCostSummary(data, totalCost);
    } catch (err) {
        console.error("Inventory Load Error:", err);
        tbody.innerHTML='<tr><td colspan="6" style="text-align:center; color: #ff6b6b; padding: 2rem;">Failed to load inventory.</td></tr>';
    }
}
function updateCostSummary(data, totalValue = 0) {
    const costEl = document.getElementById('total-inv-value');
    const itemsEl = document.getElementById('total-inv-items');
    if (costEl) costEl.textContent='₹' + totalValue.toLocaleString('en-IN');
    if (itemsEl) itemsEl.textContent = data.length;
}
window.openAddInventoryModal = () => {
    document.getElementById('inventory-modal-title').textContent="Add Inventory Item";
    document.getElementById('inv-item-id').value="";  
    document.getElementById('inventory-form').reset();
    document.getElementById('inventory-modal').style.display='flex';
};
window.closeInventoryModal = () => {
    document.getElementById('inventory-modal').style.display='none';
};
window.handleInventorySubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent="Saving...";
    btn.disabled = true;
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        const fd = new FormData(e.target);
        const id = document.getElementById('inv-item-id').value;
        const itemData = {
            user_id: user.id,
            item_name: fd.get('item_name'),
            category: fd.get('category'),
            quantity: parseFloat(fd.get('quantity')),
            unit: fd.get('unit'),
            cost_per_unit: parseFloat(fd.get('cost_per_unit')),
            low_stock_limit: parseFloat(fd.get('low_stock_limit')) || 10
        };
        let error;
        if (id) {
            const { error: err } = await window.supabaseClient
                .from('inventory')
                .update(itemData)
                .eq('id', id);
            error = err;
        } else {
            const { error: err } = await window.supabaseClient
                .from('inventory')
                .insert([itemData]);
            error = err;
        }
        if (error) throw error;
        window.closeInventoryModal();
        loadInventory();
        alert("Inventory updated successfully!");
    } catch (err) {
        console.error("Save Error:", err);
        alert("Failed to save item: " + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};
window.deleteInventory = async (id) => {
    console.log("Attempting to delete inventory item:", id);
    if (!confirm("Delete this item from inventory?")) {
        console.log("Deletion cancelled.");
        return;
    }
    try {
        const { error } = await window.supabaseClient
            .from('inventory')
            .delete()
            .eq('id', id);
        if (error) throw error;
        console.log("Item deleted. Reloading...");
        await loadInventory();
    } catch (err) {
        console.error("Delete Inventory Error:", err);
        alert("Error deleting: " + err.message);
    }
};
window.editInventory = async (id) => {
    try {
        const { data: item, error } = await window.supabaseClient
            .from('inventory')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        document.getElementById('inventory-modal-title').textContent="Edit Item";
        document.getElementById('inv-item-id').value = item.id;
        const form = document.getElementById('inventory-form');
        form.querySelector('[name="item_name"]').value = item.item_name;
        form.querySelector('[name="category"]').value = item.category;
        form.querySelector('[name="quantity"]').value = item.quantity;
        form.querySelector('[name="unit"]').value = item.unit;
        form.querySelector('[name="cost_per_unit"]').value = item.cost_per_unit;
        form.querySelector('[name="low_stock_limit"]').value = item.low_stock_limit;
        document.getElementById('inventory-modal').style.display='flex';
    } catch (err) {
        console.error(err);
        alert("Could not load item details.");
    }
};
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
});