using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using AngularTraining.Domain.Abstract;

namespace AngularTraining.Domain.Models
{
    public class Role : IdentityRole<int>, IEntity
    {
    }
}
