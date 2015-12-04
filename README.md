# node-red-integration
## Requirement

  - node 0.12.2+
  - node-red 0.12.2+

## Add Kii nodes to node-red

  - clone this repository
  - put it under `nodesDir`

    `nodesDir` is defaulted as `~/.node-red/nodes`. You can configured your custom path in `~/.node-red/settings.js`

  - restart node-red

## Import sample flow

### Kii-thing sample on Intel Edison

- Set up node-red in Edison
- Add Kii nodes
- Add node-red-node-intel-gpio nodes

  node-red-node-intel-gpio for read/write data to edison. Please check the [Guild](http://flows.nodered.org/node/node-red-node-intel-gpio)

- Restart node-red
- Access the Node-RED editor at http://localhost:1880.
- Import `sample_flows/flows_kii_thing_edison.json` from editor
