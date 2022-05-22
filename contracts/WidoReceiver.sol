//SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../interfaces/IStargateRouter.sol";
import "../interfaces/IStargateReceiver.sol";
import "../interfaces/IWidoRouter.sol";

contract WidoReceiver is IStargateReceiver, Initializable, OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IWidoRouter public widoRouter;
    IStargateRouter public stargateRouter;

    function initialize(
        IWidoRouter _widoRouter,
        IStargateRouter _stargateRouter
    ) public initializer {
        __Ownable_init();

        widoRouter = _widoRouter;
        stargateRouter = _stargateRouter;
    }

    function setWidoRouter(address _widoRouter) public onlyOwner {
        widoRouter = IWidoRouter(_widoRouter);
    }

    function setStargateRouter(address _stargateRouter) public onlyOwner {
        stargateRouter = IStargateRouter(_stargateRouter);
    }

    function _approveToken(
        address token,
        address spender,
        uint256 amount
    ) internal {
        IERC20Upgradeable _token = IERC20Upgradeable(token);
        if (_token.allowance(address(this), spender) >= amount) return;
        else {
            _token.safeApprove(spender, type(uint256).max);
        }
    }

    function sgReceive(
        uint16 _srcChainId, // the remote chainId sending the tokens
        bytes memory _srcAddress, // the remote Bridge address
        uint256 _nonce,
        address _token, // the token contract on the local chain
        uint256 amountLD, // the qty of local _token contract tokens
        bytes memory payload
    ) external override {
        require(
            msg.sender == address(stargateRouter),
            "Only Stargate router can call sgReceive"
        );

        uint256 initTokenAmount = IERC20Upgradeable(_token).balanceOf(
            address(this)
        );

        IWidoRouter.CrossChainOrder memory o;
        IWidoRouter.SwapRoute[] memory swapRoute;
        (o, swapRoute) = abi.decode(
            payload,
            (IWidoRouter.CrossChainOrder, IWidoRouter.SwapRoute[])
        );

        IWidoRouter.Order memory order = IWidoRouter.Order(
            address(this),
            _token,
            o.toToken,
            amountLD,
            o.minToTokenAmount,
            0,
            0
        );

        _approveToken(_token, address(widoRouter), amountLD);
        try IWidoRouter(widoRouter).executeOrder(order, swapRoute) returns (
            uint256 toTokenBalance
        ) {
            // Check Output Token
            require(toTokenBalance >= order.minToTokenAmount);

            // Distribute Token
            IERC20Upgradeable(order.toToken).transfer(o.user, toTokenBalance);
        } catch {
            IERC20Upgradeable(_token).transfer(o.user, amountLD);
        }

        uint256 finalTokenAmount = IERC20Upgradeable(_token).balanceOf(
            address(this)
        );
        require(finalTokenAmount == initTokenAmount - amountLD);
    }
}
