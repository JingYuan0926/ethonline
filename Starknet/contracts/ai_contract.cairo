%lang starknet

@storage_var
func prediction_result() -> (result: felt):
end

@external
func set_prediction_result{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(new_result: felt):
    prediction_result.write(new_result)
    return ()
end

@view
func request_prediction{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(input_data: felt) -> (success: felt):
    return (1)
end

@view
func get_prediction{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (result: felt):
    let (result) = prediction_result.read()
    return (result)
end