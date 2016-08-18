# ngWordpress
Angular module that provides a service for interacting with the [Wordpress REST API v2](http://v2.wp-api.org/ "WP REST API v2 Documentation")

---

The goal of this project is to empower developers to build hybrid websites with an angular frontend that are powered by Wordpress. **No PHP required.**

This is ideal for angular developers that want to quickly bootstrap a CMS without needing to worry about the backend details. Wordpress was chosen for its popularity, maturity, and familiarty to users. With the introduction of their REST API, the door is opened for developers to build beautiful, Wordpress-driven websites without needing to learn PHP.

## Current State

This is currently being developed as a side-project, and is not yet at a state I would consider 1.0. I will try to gather the remaing features to be developed:

- Finish comments
- Pagination
- Optimize post management in memory.
- etc

## Current Features

**Note: With the single exception of adding comments, this module only supports GET requests for the various resources.**

### Core

1. Site Name and Tagline
2. Posts
3. Pages
4. Media
5. Comments
6. Categories

### Plugin Required

1. Sticky Post
