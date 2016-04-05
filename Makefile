PIP = pip
PIP_FOLDER = .pip
PYTHON = python3

CONTENT-TOOLS_VERSION = 1.2.2
CONTENT-TOOLS_URL = https://github.com/GetmeUK/ContentTools/archive/$(CONTENT-TOOLS_VERSION).zip
CONTENT-TOOLS_SRC_FOLDER = ContentTools-$(CONTENT-TOOLS_VERSION)/
CONTENT-TOOLS_DEST_FOLDER = static/content-tools/

UPLOAD_FOLDER = static/upload

STYLE_FOLDER = static/style/

CUSTOM_STYLE_FILE = variables.less
CUSTOM_SCRIPT_FILE = static/scripts/variables.js

EXPORT_FOLDER = export/

LESS = lessc
WGET = curl -OL
UNZIP = unzip -q
CP = cp -R
MKDIR = mkdir -p
TOUCH = touch
RM = rm -fr

all : install run

run :
	@PYTHONPATH=@PYTHONPATH:./$(PIP_FOLDER) $(PYTHON) ./flaskr.py

install : pipinstall installcontenttools $(UPLOAD_FOLDER) $(STYLE_FOLDER)$(CUSTOM_STYLE_FILE)

pipinstall :
	$(PIP) install -t $(PIP_FOLDER) -r requirements.txt --upgrade

build :
	$(RM) $(EXPORT_FOLDER)
	$(MKDIR) $(EXPORT_FOLDER)$(STYLE_FOLDER)
	$(LESS) $(STYLE_FOLDER)style.less $(EXPORT_FOLDER)$(STYLE_FOLDER)style.css
	$(CP) index.html $(EXPORT_FOLDER)
	$(CP) static/ $(EXPORT_FOLDER)
	$(RM) $(EXPORT_FOLDER)$(CONTENT-TOOLS_DEST_FOLDER)
	$(RM) $(EXPORT_FOLDER)$(STYLE_FOLDER)*.less

# Quick and dirty
installcontenttools :
	$(RM) $(CONTENT-TOOLS_VERSION).zip
	$(WGET) $(CONTENT-TOOLS_URL)
	$(UNZIP) $(CONTENT-TOOLS_VERSION).zip
	$(CP) $(CONTENT-TOOLS_SRC_FOLDER)build/images $(CONTENT-TOOLS_DEST_FOLDER)
	$(CP) $(CONTENT-TOOLS_SRC_FOLDER)build/content-tools.min.css $(CONTENT-TOOLS_DEST_FOLDER)
	$(CP) $(CONTENT-TOOLS_SRC_FOLDER)build/content-tools.min.js $(CONTENT-TOOLS_DEST_FOLDER)
	$(RM) $(CONTENT-TOOLS_SRC_FOLDER)
	$(RM) $(CONTENT-TOOLS_VERSION).zip

$(UPLOAD_FOLDER) :
	$(MKDIR) $(UPLOAD_FOLDER)

$(STYLE_FOLDER)$(CUSTOM_STYLE_FILE) :
	$(TOUCH) $(STYLE_FOLDER)$(CUSTOM_STYLE_FILE)

$(CUSTOM_SCRIPT_FILE) :
	$(TOUCH) $(CUSTOM_SCRIPT_FILE)
