
require('dotenv').config();
const express = require('express')
const { generateSlug } = require('random-word-slugs')
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs')
const cors = require('cors');

const app = express()
const PORT = 9000

app.use(cors()); 
app.use(express.json());

const subnets = [
    process.env.AWS_SUBNET_1,
    process.env.AWS_SUBNET_2,
    process.env.AWS_SUBNET_3,
    process.env.AWS_SUBNET_4,
    process.env.AWS_SUBNET_5,
    process.env.AWS_SUBNET_6
];

const securityGroups = [process.env.AWS_SECURITY_GROUPS];

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const config = {
    CLUSTER: process.env.AWS_cluster,
    TASK: process.env.AWS_task
}

app.use(express.json())

app.post('/project', async (req, res) => {
    const { gitURL} = req.body
    const projectSlug = generateSlug()

    // Spin the container
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets:subnets,
                securityGroups: securityGroups
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        { name: 'GIT_REPOSITORY__URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command);

    return res.json({ status: 'queued', data: { projectSlug, url: `http://${projectSlug}.localhost:8000` } })

})

app.listen(PORT, () => console.log(`API Server Running..${PORT}`))