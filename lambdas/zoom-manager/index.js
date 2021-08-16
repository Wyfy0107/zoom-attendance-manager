const aws = require('aws-sdk')
const axios = require('axios')

const s3 = new aws.S3()

const moment = () => new Date().toISOString()

const getParticipants = async id => {
  return axios.get(`https://api.zoom.us/v2/metrics/meetings/${id}/participants`)
}

const getMeetingList = async () => {
  const today = new Date().toLocaleDateString('en-CA')
  return axios.get(
    `https://api.zoom.us/v2/metrics/meetings?type=past&from=${today}&to=${today}`
  )
}

const putReportToBucket = async participants => {
  const params = {
    ACL: 'private',
    Body: JSON.stringify(participants),
    Bucket: process.env.RAW_BUCKET,
    Key: `${report.meetingId}-${moment()}`,
  }
  await s3.putObject(params).promise()
}

const processMeeting = async meeting => {
  const { id } = meeting
  const {
    data: { participants },
  } = await getParticipants(id)

  // const { user_name, email } = participants
  await putReportToBucket(participants)
}

exports.lambda_handler = async (event, context, callback) => {
  try {
    const {
      data: { meetings },
    } = await getMeetingList()
    if (meetings.length > 0) {
      meetings.forEach(async m => await processMeeting(m))
    }

    callback(null, { status: 'done' })
  } catch (err) {
    console.error(err)
    callback(err)
  }
}
