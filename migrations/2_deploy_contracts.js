var TinyToken = artifacts.require("./TinyToken.sol");
var TinyTokenSale = artifacts.require("./TinyTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(TinyToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(TinyTokenSale, TinyToken.address, tokenPrice);
 // }).then(function(){
//  	var tokensAvailable = 750000;
 // 	TinyToken.deployed().then(function(instance) {instance.transfer(TinyTokenSale.address, tokensAvailable, {from: 
//"0x254ef4D40024e2Ce05d2a222d512F09941dc85fC"});
//  })
  });
};
