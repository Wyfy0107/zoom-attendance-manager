const aws = require('aws-sdk')

const s3 = new aws.S3()
const moment = () => new Date().toISOString()
// array of student zoom username
const classList = []

const putReportToBucket = async report => {
  const params = {
    ACL: 'private',
    Body: JSON.stringify(report),
    Bucket: process.env.REPORT_BUCKET,
    Key: moment(),
  }
  await s3.putObject(params).promise()
}

const deleteObjects = async objectKeys => {
  const params = {
    Bucket: process.env.RAW_BUCKET,
    Delete: { Objects: objectKeys },
  }
  await s3.deleteObjects(params).promise()
}

const processReport = async () => {
  const params = {
    Bucket: process.env.RAW_BUCKET,
  }

  const { Contents } = await s3
    .listObjects(params)
    .promise()
    .then(data => data)

  const data = {}
  const deleteQueue = []

  Contents.forEach(obj => {
    const key = obj.Key
    const meetingId = key.split('-')[0]
    deleteQueue.push({ Key: key })

    const params = {
      Bucket: process.env.RAW_BUCKET,
      Key: key,
    }
    const participants = await s3
      .getObject(params)
      .promise()
      .then(data => JSON.parse(data.Body))

    participants.forEach(student => {
      const { user_name } = student
      data[key] = [...data[meetingId], user_name]
    })
  })

  const absenceList = []

  // key has the shape: "meetingId-isoDate"
  Object.keys(data).map(key => {
    const present = data[key]
    const numberOfParticipants = present.length
    if (numberOfParticipants < classList.length) {
      const absence = classList.filter(username => !present.includes(username))
      absenceList.concat(absence)
    }
  })

  const result = {}
  absenceList.forEach(studentName => {
    if (result.hasOwnProperty(studentName)) {
      result[studentName]++
      return
    }
    result[studentName] = 0
  })

  result['total_week_lectures'] = Contents.length
  await putReportToBucket(result)
  await deleteObjects(deleteQueue)
}

exports.lambda_handler = async (event, context, callback) => {
  try {
    await processReport()
    callback(null, { status: 'done' })
  } catch (err) {
    console.error(err)
    callback(err)
  }
}
