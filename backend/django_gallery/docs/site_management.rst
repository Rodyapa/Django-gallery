Site Appearance
===============

Currently, users can only change the site title, which is set when the project is started. 
See the :doc:`installation` for more details.

To change the site design, such as the photos used on the index page, 
you need to manually replace the JPEG images in the static/dis folder and modify index.html. This part of customization will be improved in future versions.

Navbar Sections Management
--------------------------

The navbar is a dynamically rendered part of the site. It always contains links to the index page and the contact page. Between these two links, custom user sections and albums are located. Users can add sections on the "Sections" page in the admin zone.

A section can be marked as a "highest section." In this case, it will appear at the top level of the navigation menu. A section can also have a parent section; in this case, it will be located in a dropdown list under the parent section.

If a section is marked as the highest section, it cannot have any parent sections.

Sections can also have albums associated with them. Therefore, a dropdown list for a section can contain other sections or links to albums.

Sections also can have albums related to them. Therefore, dropdown list of a section 
can have another sections or links to an albums.

Contact Links
-------------
Currently, the links on the contact page are set by required constants. In the future, users will be able to add links via the admin zone.

Album management
----------------
Users can create three types of albums:

1. **Simple Album**
2. **Subcategory Divided Album**
3. **Year Divided Album**

All albums share the following common properties:
    * Title: Displayed in the navbar and at the top of the album page.
    * Description: Displayed below the title if "Show Description" is selected.
    * Is on Main Page: If this checkbox is selected, the album will appear at the first level of the navigation menu.
    * Section: The album will be listed in the dropdown menu of the selected section.
    * Template: Defines which category the current album belongs to. The template can be changed at any time.

On each album's admin page, you can upload photos using the dropzone field.

WARNING: You need to save the album before uploading photos with the dropzone.

Simple Album
~~~~~~~~~~~~

Simple Albums allow users to upload photos and change their positions using 
drag-and-drop functionality.

Subcategory Album
~~~~~~~~~~~~~~~~~
Subcategory Albums allow users to associate photos with specific subcategories (which can be created on the Album Subcategories admin page). 
Photos on the album's frontend page will be grouped under subcategory titles. Subcategory titles can contain Russian and English letters, hyphens, spaces, and underscores.

Year Divided Album
~~~~~~~~~~~~~~~~~~
Year Divided Albums allow users to organize photos by year. The year should be a 4-digit number. The year-divided album page automatically creates a dropzone with the value of the current year. If no photo is added in this zone, the current year will not be displayed on the frontend. Users can add more years. 

Photos on the frontend page are sorted from the most recent year to the oldest and are grouped under a year header.

Photo Management.
Photo management is available on the "Photos" admin page.
