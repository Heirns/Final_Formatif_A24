using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WebAPI.Controllers;
using WebAPI.Exceptions;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Tests;

[TestClass]
public class SeatsControllerTests
{

    [TestMethod]
    public void ReserveSeat()
    {
        Mock<SeatsService> seatsServiceMock = new Mock<SeatsService>();

        var expectedSeat = new Seat { Number = 1 };

        seatsServiceMock.Setup(s => s.ReserveSeat("user123", 1)).Returns(expectedSeat);

        Mock<SeatsController> seatsControllerMock = new Mock<SeatsController>(seatsServiceMock.Object) { CallBase = true};

        seatsControllerMock.Setup(t => t.UserId).Returns("user123");

        var actionresult = seatsControllerMock.Object.ReserveSeat(1);
        var result = actionresult.Result as OkObjectResult;

        Assert.IsNotNull(result);
        Assert.AreEqual(result.Value, expectedSeat);
    }

    [TestMethod]
    public void ReserveSeatAlreadyTaken()
    {
        Mock<SeatsService> seatsServiceMock = new Mock<SeatsService>();

        var expectedSeat = new Seat { Number = 1 };

        seatsServiceMock.Setup(s => s.ReserveSeat("user123", 1)).Throws(new SeatAlreadyTakenException());

        Mock<SeatsController> seatsControllerMock = new Mock<SeatsController>(seatsServiceMock.Object) { CallBase = true };

        seatsControllerMock.Setup(t => t.UserId).Returns("user123");

        var actionresult = seatsControllerMock.Object.ReserveSeat(1);
        var result = actionresult.Result as UnauthorizedResult;

        Assert.IsInstanceOfType(result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public void ReserveSeatOutOfBounds()
    {
        Mock<SeatsService> seatsServiceMock = new Mock<SeatsService>();

        var expectedSeat = new Seat { Number = 1 };

        seatsServiceMock.Setup(s => s.ReserveSeat("user123", 1)).Throws(new SeatOutOfBoundsException());

        Mock<SeatsController> seatsControllerMock = new Mock<SeatsController>(seatsServiceMock.Object) { CallBase = true };

        seatsControllerMock.Setup(t => t.UserId).Returns("user123");

        var actionresult = seatsControllerMock.Object.ReserveSeat(1);
        var result = actionresult.Result as NotFoundObjectResult;

        Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        Assert.AreEqual(result.Value, "Could not find " + expectedSeat.Number);
    }

    [TestMethod]
    public void ReserveSeatAlreadySeated()
    {
        Mock<SeatsService> seatsServiceMock = new Mock<SeatsService>();

        var expectedSeat = new Seat { Number = 1 };

        seatsServiceMock.Setup(s => s.ReserveSeat("user123", 1)).Throws(new UserAlreadySeatedException());

        Mock<SeatsController> seatsControllerMock = new Mock<SeatsController>(seatsServiceMock.Object) { CallBase = true };

        seatsControllerMock.Setup(t => t.UserId).Returns("user123");

        var actionresult = seatsControllerMock.Object.ReserveSeat(1);
        var result = actionresult.Result as BadRequestResult;

        Assert.IsInstanceOfType(result, typeof(BadRequestResult));
    }
}
