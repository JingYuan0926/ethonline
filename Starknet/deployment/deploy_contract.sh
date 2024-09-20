# Add this at the top of your script
export PATH="$HOME/.local/bin:$PATH"

# Rest of your script
starknet-compile ../contracts/ai_contract.cairo --output ai_contract.json --abi ai_contract_abi.json
starknet deploy --contract ai_contract.json --network http://127.0.0.1:5050