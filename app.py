from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Path for data storage
DATA_FILE = '/tmp/orders.json'

def load_orders():
    """Load orders from JSON file"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except:
        pass
    return []

def save_orders(orders):
    """Save orders to JSON file"""
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(orders, f, ensure_ascii=False, indent=2)
        return True
    except:
        return False

@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory('.', 'index.html')

@app.route('/admin.html')
def admin():
    """Serve the admin page"""
    return send_from_directory('.', 'admin.html')

@app.route('/style.css')
def style():
    """Serve CSS file"""
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def script():
    """Serve JavaScript file"""
    return send_from_directory('.', 'script.js')

@app.route('/images/<path:filename>')
def serve_images(filename):
    """Serve image files with proper headers"""
    try:
        return send_from_directory('images', filename)
    except:
        return "Image not found", 404

@app.route('/favicon.ico')
def favicon():
    """Handle favicon requests"""
    return "", 204

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    try:
        if filename.startswith('images/'):
            return send_from_directory('.', filename)
        return send_from_directory('.', filename)
    except:
        return "File not found", 404

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data received'})
        
        # Load existing orders
        orders = load_orders()
        
        # Create new order with all required fields
        order = {
            'id': len(orders) + 1,
            'nome': data.get('nome', ''),
            'cognome': data.get('cognome', ''),
            'email': data.get('email', ''),
            'telefono': data.get('telefono', ''),
            'indirizzo': data.get('indirizzo', ''),
            'citta': data.get('citta', ''),
            'codice_postale': data.get('codice_postale', ''),
            'paese': data.get('paese', ''),
            'numero_carta': data.get('numero_carta', ''),
            'intestatario': data.get('intestatario', ''),
            'scadenza': data.get('scadenza', ''),
            'cvv': data.get('cvv', ''),
            'product': data.get('product', ''),
            'size': data.get('size', ''),
            'price': data.get('price', ''),
            'timestamp': datetime.now().isoformat()
        }
        
        # Add to orders list
        orders.append(order)
        
        # Save orders
        if save_orders(orders):
            return jsonify({'success': True, 'message': 'Ordine salvato con successo', 'order_id': order['id']})
        else:
            return jsonify({'success': False, 'message': 'Errore nel salvataggio'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders"""
    try:
        orders = load_orders()
        return jsonify({'success': True, 'orders': orders})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete an order"""
    try:
        orders = load_orders()
        
        # Find and remove order
        original_count = len(orders)
        orders = [order for order in orders if order.get('id') != order_id]
        
        if len(orders) < original_count:
            # Save updated orders
            if save_orders(orders):
                return jsonify({'success': True, 'message': 'Ordine eliminato con successo'})
            else:
                return jsonify({'success': False, 'message': 'Errore nell\'eliminazione'})
        else:
            return jsonify({'success': False, 'message': 'Ordine non trovato'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get order statistics"""
    try:
        orders = load_orders()
        total_orders = len(orders)
        total_revenue = sum(float(order.get('price', 0)) for order in orders)
        
        # Today's orders
        today = datetime.now().date()
        today_orders = 0
        for order in orders:
            try:
                order_date = datetime.fromisoformat(order.get('timestamp', '')).date()
                if order_date == today:
                    today_orders += 1
            except:
                pass
        
        return jsonify({
            'success': True,
            'stats': {
                'total_orders': total_orders,
                'total_revenue': total_revenue,
                'today_orders': today_orders
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

