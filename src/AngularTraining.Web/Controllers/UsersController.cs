using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AngularTraining.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using AngularTraining.Web.ViewModels;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AngularTraining.Web.Controllers
{
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        public UserManager<User> UserManager { get; }
        public UsersController(UserManager<User> userManager)
        {
            UserManager = userManager;
        }

        [HttpGet, Authorize(Roles="Administrator")]
        [ResponseCache(NoStore = true)]
        public async Task<IEnumerable<UserViewModel>> Get()
        {
            var users = new List<UserViewModel>();

            foreach (var user in (await UserManager.Users.ToListAsync()))
            {
                var userViewModel = new UserViewModel()
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    EmailAddress = user.Email,
                    Id = user.Id,
                    Roles = (await UserManager.GetRolesAsync(user)).SingleOrDefault()
                };

                users.Add(userViewModel);
            }

            return users;
        }

        [HttpPost, Authorize(Roles = "Administrator")]
        public async Task<UserViewModel> Post([FromBody]UserViewModel viewModel)
        {
            UserViewModel newUser = null;

            var user = new User
            {
                UserName = viewModel.EmailAddress,
                Email = viewModel.EmailAddress,
                FirstName = viewModel.FirstName,
                LastName = viewModel.LastName
            };

            IdentityResult identityResult = await UserManager.CreateAsync(user, viewModel.Password);

            if (identityResult.Succeeded)
            {
                newUser = new UserViewModel
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    EmailAddress = user.Email
                };
                if (viewModel.Roles != null && viewModel.Roles.Length > 0)
                {
                    identityResult = await UserManager.AddToRoleAsync(user, viewModel.Roles);

                    if (identityResult.Succeeded)
                    {
                        newUser.Roles = (await UserManager.GetRolesAsync(user)).SingleOrDefault();
                    }
                }
            }

            return newUser;
        }
    }
}
