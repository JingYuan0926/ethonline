import { task } from 'hardhat/config';
import { getEidForNetworkName } from '@layerzerolabs/devtools-evm-hardhat';
import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities';
import { Options } from '@layerzerolabs/lz-v2-utilities';
import { BigNumberish, Bytes, BytesLike } from 'ethers';

interface SendParam {
    dstEid: BigNumberish
    to: BytesLike
    amountLD: BigNumberish
    minAmountLD: BigNumberish
    extraOptions: BigNumberish
    composeMsg: BytesLike
    oftCmd: BytesLike
}

task('lz:oft:send', 'Send tokens from either OFT or OFTAdapter')
    .addParam('to', 'Contract Address on Network B')
    .addParam('destination', 'Name of Network B')
    .addParam('amount', 'Amount of Tokens to Transfer in Token Decimals')
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const toAddress = taskArgs.to;
        const eidB = getEidForNetworkName(taskArgs.destination);

        const oftDeployment = await deployments.get('MyOFT');
        const [signer] = await ethers.getSigners();

        const oftContract = new ethers.Contract(oftDeployment.address, oftDeployment.abi, signer);

        const decimals = await oftContract.decimals();
        const amount = ethers.utils.parseUnits(taskArgs.amount, decimals);
        let options = Options.newOptions().addExecutorLzReceiveOption(6500, 0).toBytes();

        const sendParam: SendParam = {
            dstEid: eidB,
            to: addressToBytes32(toAddress),
            amountLD: amount!,
            minAmountLD: amount!,
            extraOptions: options,
            composeMsg: ethers.utils.arrayify('0x'),
            oftCmd: ethers.utils.arrayify('0x')
        };
        const feeQuote = await oftContract.quoteSend(sendParam,false);
        const nativeFee = await oftContract.nativeFee;

        console.log(`sending ${taskArgs.amount} tokens to ${toAddress} on ${taskArgs.destination} with fee ${feeQuote} and native fee ${nativeFee}`);

        const r = await oftContract.send(sendParam, {nativeFee: nativeFee, lzTokenFee: 0}, {
            from: signer.address,
            value: nativeFee
        });

        console.log(`Send tx initiated. See: https://layerzeroscan.com/tx/${r.hash}`);
        

    });

    export default 'sendOFT'


