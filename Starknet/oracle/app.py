from flask import Flask, request, jsonify
import tensorflow as tf
from starkware.starknet.public.abi import get_storage_var_address
from starknet_py.net import Client
from starknet_py.net.signer.stark_curve_signer import KeyPair

# Load the trained AI model
model = tf.keras.models.load_model('price_prediction_model.h5')

app = Flask(__name__)

# StarkNet client setup (StarkNet-devnet)
client = Client(net="http://localhost:5050")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_value = float(data['input'])
    
    # Make a prediction using the AI model
    prediction = model.predict([[input_value]])[0][0]
    
    contract_address = "YOUR_CONTRACT_ADDRESS"
    function_name = "set_prediction_result"
    
    prediction_felt = int(prediction * 10**6)
    
    client.send_transaction(
        signer=KeyPair(public_key=YOUR_PUBLIC_KEY, private_key=YOUR_PRIVATE_KEY),
        contract_address=contract_address,
        entry_point_selector=function_name,
        calldata=[prediction_felt]
    )

    return jsonify({"success": True, "prediction": prediction_felt})

if __name__ == '__main__':
    app.run(port=8000)