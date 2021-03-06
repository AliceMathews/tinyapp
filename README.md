# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Features analytics to show number of visits, number of unique visits and log information about each visit.

## Final Product

Screenshot of /urls pages when user is logged in. It shows a list of the users urls
![Screenshot of /urls pages when user is logged in. It shows a list of the users urls](https://github.com/AliceMathews/tinyapp/blob/master/docs/urls.png)

Screenshot of /urls page if the user is not logged in
!["Screenshot of /urls page if the user is not logged in"](https://github.com/AliceMathews/tinyapp/blob/master/docs/urls-notloggedin.png)

Screenshot of create URL page
!["Screenshot of create URL page"](https://github.com/AliceMathews/tinyapp/blob/master/docs/createURL.png)

Screenshot of the show URL page, which shows the information about the URL and allows the user to edit, if this URL belongs to them
!["screenshot of the show URL page, which shows the information about the URL and allows the user to edit, if this URL belongs to them"](https://github.com/AliceMathews/tinyapp/blob/master/docs/showURLs.png)

Screenshot of the error page that renders with a specific message to the user depending on the error
!["Screenshot of the error page that renders with a specific message to the user depending on the error"](https://github.com/AliceMathews/tinyapp/blob/master/docs/errorpage.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- cookie-parser
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.