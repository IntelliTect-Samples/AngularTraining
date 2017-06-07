using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AngularTraining.Domain.Models;
using AngularTraining.Domain.Abstract;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AngularTraining.Web.Controllers
{
    [Route("api/[controller]")]
    public class ProjectController : Controller
    {
        public IProjectRepository ProjectRepository { get; }
        public ProjectController(IProjectRepository projectRepository)
        {
            ProjectRepository = projectRepository;
        }

        [HttpGet]
        public IEnumerable<Project> Get()
        {
            return ProjectRepository.AllIncluding(p => p.Client);
        }
    }
}
