import { Agenda } from 'agenda';
import { JobStatus } from './enum';
const JobManagement = require('../components/jobManagment/jobManagmentModel');
const Job = require('../components/jobs/jobModel');
const User = require('../components/users/userModel');
const config = require("config");
import eventEmitter from "../utils/event";
import mongoose, { Types } from 'mongoose';
import { AppStrings } from './appStrings';

const activeStatus = [JobStatus.ACCEPT_BY_PROVIDER, JobStatus.ACCEPT_BY_SEEKER]
const requestedJobStatus = [JobStatus.APPLYING, JobStatus.HIRING]
// const jobStatues =  [JobStatus.OPEN,JobStatus.ASSIGNED,JobStatus.COMPLETED,JobStatus.EXPIRED,JobStatus.CANCELLED];

const agenda = new Agenda({ db: { address: config.get("DB_CONN_STRING"), collection: 'jobScheduleTask' } });

const setActiveJob = async (job_id: any, LANG: any) => {
    try {
        const jobs = await Job.findById(job_id);
        if (jobs && jobs.currentStatus === JobStatus.ASSIGNED && jobs.seeker_count !== jobs.seeker_availability) {
            jobs.currentStatus = JobStatus.ACTIVE;
            await jobs.save({ userType: "🤖" });

            const statusHistory = {
                userType: "🤖",
                status: JobStatus.ACTIVE,
                date_: new Date()
            }

            await JobManagement.updateMany(
                { job_id: job_id, jobStatus: { $in: activeStatus } },
                { $set: { jobStatus: JobStatus.ACTIVE }, $push: { statusHistory: statusHistory } })

            await JobManagement.deleteMany({ job_id: job_id, jobStatus: { $in: requestedJobStatus } })

            // notification start
            const activeSeekers = await JobManagement.find({ job_id: job_id, jobStatus: JobStatus.ACTIVE }).distinct("seeker_id")

            // changes(dhaval)
            let seekersWhoActiveTheJob: any = []
            activeSeekers.map((p: any) => {
                seekersWhoActiveTheJob.push(p.toString())
            })
            // end

            const tokenData = await User.find({ _id: { $in: activeSeekers } }).distinct('pushToken')
            let tokens: any = [];
            tokens.push(...tokenData)
            const pushToken = await User.getPushToken(jobs.user_id);
            tokens.push(pushToken)

            // changes(dhaval)
            const eventObject = {
                jobId: job_id.toString(),
                tokens,
                providerId: jobs.user_id,
                seekerIds: seekersWhoActiveTheJob,
                // title: 'Active job',
                // body: `${jobs.title} job is active for now`,
                title: AppStrings['en'].ACTIVE_JOB.TITLE,
                body: AppStrings['en'].ACTIVE_JOB.BODY.replace(':title', jobs.title),
                titleHindi: AppStrings['hi'].ACTIVE_JOB.TITLE,
                bodyHindi: AppStrings['hi'].ACTIVE_JOB.BODY.replace(':title', jobs.title),
                jobTitle: jobs.title
            };
            // end

            eventEmitter.emit("jobs.active", eventObject);
            // notification end
        }
    } catch (error) {
        console.log('activeJobStatus', error);
    }
}

const setCompleteJob = async (job_id: any, LANG: any) => {
    try {
        const jobs = await Job.findById(job_id);
        if (jobs && jobs.currentStatus === JobStatus.ACTIVE) {
            console.log("completeJobStatus");

            jobs.currentStatus = JobStatus.COMPLETED;
            await jobs.save({ userType: "🤖" });

            const statusHistory = {
                userType: "🤖",
                status: JobStatus.COMPLETED,
                date_: new Date()
            }

            await JobManagement.updateMany(
                { job_id: job_id, jobStatus: JobStatus.ACTIVE },
                { $set: { jobStatus: JobStatus.COMPLETED }, $push: { statusHistory: statusHistory } })

            await JobManagement.deleteMany({ job_id: job_id, jobStatus: { $in: requestedJobStatus } })

            const mangementData = await JobManagement.find({ job_id: job_id, jobStatus: JobStatus.COMPLETED }).distinct('seeker_id')
            let seekersWhoCompleteTheJob: any = []
            mangementData.map((p: any) => {
                seekersWhoCompleteTheJob.push(p.toString())
            })

            //notification start
            const tokenData = await User.find({ _id: { $in: mangementData } }).distinct('pushToken')
            let tokens: any = [];
            tokens.push(...tokenData)
            const pushToken = await User.getPushToken(jobs.user_id);
            tokens.push(pushToken)
            // notification end

            const eventObject = {
                jobId: jobs._id,
                providerId: jobs.user_id,
                releaseAmount: (jobs.amount.wages + jobs.amount.adminFees) * jobs.seeker_count,
                paybleAmountToProvider: (jobs.amount.wages + jobs.amount.adminFees) * (jobs.seeker_count - jobs.seeker_availability),
                seekerIds: seekersWhoCompleteTheJob,
                paybleAmountToseeker: jobs.amount.wages,
                totalHour: jobs.work.duration,
                tokens,
                // title: 'Complete job', 
                // body: `${jobs.title} job is completed`,
                title: AppStrings['en'].COMPLETE_JOB.TITLE,
                body: AppStrings['en'].COMPLETE_JOB.BODY.replace(':title', jobs.title),
                titleHindi: AppStrings['hi'].COMPLETE_JOB.TITLE,
                bodyHindi: AppStrings['hi'].COMPLETE_JOB.BODY.replace(':title', jobs.title),
                jobTitle: jobs.title
            };

            eventEmitter.emit("jobs.completed", eventObject);
        }
    } catch (error) {
        console.log('completeJobStatus', error);
    }
}

const setExpiredJob = async (job_id: any, LANG: any) => {
    try {
        const job_ = await Job.findById(job_id);
        let expired = false;
        if (job_ && job_.currentStatus === JobStatus.OPEN) {
            expired = true
        }
        if (job_ && job_.currentStatus === JobStatus.ASSIGNED && job_.seeker_count === job_.seeker_availability) {
            expired = true
        }
        const pushToken = await User.getPushToken(job_.user_id);
        if (expired) {
            eventEmitter.emit("jobs.expired", {
                // title: 'Expired job',
                // body: `Your job ${job_.title} is expired`,
                title: AppStrings['en'].EXPIRED_JOB.TITLE,
                body: AppStrings['en'].EXPIRED_JOB.BODY.replace(':title', job_.title),
                titleHindi: AppStrings['hi'].EXPIRED_JOB.TITLE,
                bodyHindi: AppStrings['hi'].EXPIRED_JOB.BODY.replace(':title', job_.title),
                jobTitle: job_.title,
                pushToken: pushToken,

                jobId: job_id.toString(),
                userId: job_.user_id,
                amount: (job_.amount.wages + job_.amount.adminFees) * job_.seeker_count,
            });
            await Job.deleteOne({ _id: new mongoose.Types.ObjectId(job_id) })
            await JobManagement.deleteMany({ job_id: new mongoose.Types.ObjectId(job_id) })
            await agenda.cancel({ name: "activeJobStatus", 'data.job_id': new mongoose.Types.ObjectId(job_id) })
            await agenda.cancel({ name: "completeJobStatus", 'data.job_id': new mongoose.Types.ObjectId(job_id) })
        }
    } catch (error) {
        console.log('expiredStatus2', error);
    }
}

//verified ✅
agenda.define('activeJobStatus',
    async (job: any) => {
        const { job_id, LANG } = job.attrs.data;
        await setActiveJob(job_id, LANG)
    }
)

agenda.define('completeJobStatus',
    async (job: any) => {
        const { job_id, LANG } = job.attrs.data;
        await setCompleteJob(job_id, LANG)
    }
)

// verified ✅
agenda.define('expiredStatus',
    async (job: any) => {
        const { job_id, LANG } = job.attrs.data;
        await setExpiredJob(job_id, LANG)
    }
)

agenda.define('removeNoApplyJobTag',
    async (job: any) => {
        const { user_id } = job.attrs.data;
        await User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(user_id) }, { $set: { noJobApplyForTheDay: false } }, { upsert: true })
    })

export default agenda;