const loadBalancerServerNode = getFirstNode(
    '/ServiceCallout/HTTPTargetConnection/LoadBalancer/Server',
    element
);

if (loadBalancerServerNode) {
    trust = 'internal';
}