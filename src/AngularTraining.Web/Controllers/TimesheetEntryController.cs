using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AngularTraining.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using AspNet.Security.OpenIdConnect.Primitives;
using AngularTraining.Domain.Abstract;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AngularTraining.Web.Controllers
{
    [Route("api/[controller]")]
    public class TimesheetEntryController : Controller
    {
        public ITimesheetEntryRepository TimesheetRepository { get; }
        public TimesheetEntryController(ITimesheetEntryRepository timesheetRepository)
        {
            TimesheetRepository = timesheetRepository;
        }

        [HttpGet, Authorize]
        public IEnumerable<TimesheetEntry> Get()
        {
            var userId = Convert.ToInt32(User.FindFirst(OpenIdConnectConstants.Claims.Subject).Value);

            var timesheetEntries = TimesheetRepository.AllIncluding(t => t.Project, t => t.Project.Client).Where(t => t.UserId == userId).OrderByDescending(t => t.EndTime);

            return timesheetEntries;
        }

        [HttpPost, Authorize]
        public async Task<TimesheetEntry> Post([FromBody]TimesheetEntry timesheetEntry)
        {
            var userId = Convert.ToInt32(User.FindFirst(OpenIdConnectConstants.Claims.Subject).Value);
            timesheetEntry.UserId = userId;
            timesheetEntry.ProjectId = timesheetEntry.Project.Id;
            timesheetEntry.Project = null;

            TimesheetRepository.InsertOrUpdate(timesheetEntry);
            await TimesheetRepository.SaveAsync();

            var updatedEntry = await TimesheetRepository.AllIncluding(t => t.Project, t => t.Project.Client).SingleOrDefaultAsync(t => t.Id == timesheetEntry.Id);

            return updatedEntry;
        }
    }
}
