module.exports = {
    apps: [{
        name: 'API',
        script: 'dist/apps/api/main.js',
        node_args: '-r dotenv/config'
    }]
}