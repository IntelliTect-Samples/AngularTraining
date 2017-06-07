using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using AngularTraining.Domain.Models;

namespace AngularTraining.Domain.Concrete
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, int>
    {
        public DbSet<TimesheetEntry> TimesheetEntries { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Project> Projects { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        { }
    }
}
