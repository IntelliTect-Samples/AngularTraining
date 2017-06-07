using AngularTraining.Domain.Abstract;
using AngularTraining.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace AngularTraining.Domain.Concrete
{
    public class ProjectRepository : RepositoryBase<Project>, IProjectRepository
    {
        public ProjectRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
