const xpath = require('xpath');

const configCheckCallback = function(policy) {
    let compliant = true;

    let item = xpath.select('/SpikeArrest/Rate', policy.getElement());

    if (item.length == 0) {
        compliant = false;
        policy.addMessage({
            plugin: plugin,
            line: policy.getElement().lineNumber,
            column: policy.getElement().columnNumber,
            message: `Required SpikeArrest configuration "Rate" not found for "${policy.getName()}".`
        });
    }

    return compliant;
}



let checker = new SecurityLib.PolicyChecker(
    plugin,
    'SpikeArrest',
    debug,
    configCheckCallback
);