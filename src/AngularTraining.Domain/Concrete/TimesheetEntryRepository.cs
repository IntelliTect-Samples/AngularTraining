using AngularTraining.Domain.Abstract;
using AngularTraining.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace AngularTraining.Domain.Concrete
{
    public class TimesheetEntryRepository : RepositoryBase<TimesheetEntry>, ITimesheetEntryRepository
    {
        public TimesheetEntryRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
