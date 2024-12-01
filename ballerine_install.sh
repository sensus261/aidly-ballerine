#!/bin/bash

set -e

echo "Running as: $(id)"
# Function to display help message
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help       Display this help message."
    echo "  -d, --domain     vite_domain  Vite Domain URL."
    echo "  -v, --verbose    Enable verbose output."
    echo ""
    echo "Examples:"
    echo "  $0 --domain example.com"
    echo "  $0 -v"
}


check_http_https() {
    local input=$1
    echo "checking domain if suitable $input"
    if [[ $input == *http://* && $input != *https://* ]]; then
        echo "The string contains 'http' but not 'https'."
    elif [[ $input == *https://* && $input != *http://* ]]; then
        echo "The string contains 'https' but not 'http'."
    elif [[ $input == *http://* && $input == *https://* ]]; then
        echo "The string contains both 'http' and 'https'."
        exit 1;
    else
        echo "The string contains neither 'http' nor 'https'."
        exit 1;
    fi
}


# Check if no arguments are provided
if [ $# -eq 0 ]; then
    echo "No arguments provided. Defaulting everything to localhost."
fi


install_docker_ubuntu(){
    # Add Docker's official GPG key:
    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

install_docker_macos(){
    echo "Install docker using the following docs"
    echo "https://docs.docker.com/desktop/setup/install/mac-install/"
}

check_os() {
    # Get the operating system name
    uname_out="$(uname -s)"

    case "${uname_out}" in
        Linux*)
            # Check if the Linux distro is Ubuntu
            if [ -f /etc/os-release ]; then
                . /etc/os-release
                if [[ $ID == "ubuntu" ]]; then
                    echo "The host is running Ubuntu."
                    install_docker_ubuntu
                else
                    echo "The host is running a Linux distribution but not Ubuntu."
                    echo "We do not support this Linux distribution"
                fi
            else
                echo "The host is running Linux but /etc/os-release is not available."
            fi
            ;;
        Darwin*)
            echo "The host is running macOS."
            install_docker_macos
            ;;
        *)
            echo "The operating system is not recognized."
            ;;
    esac
}


update_frontend_build_variables() {
    VITE_DOMAIN_NAME="$1"
    ## Get frontend application env files
    echo "Updating frontend Build Variables"
    echo "Updating vite domain with $VITE_DOMAIN_NAME"
    env_files=$(find ./apps -name "*.env.example")
    echo $env_files
    for i in $env_files;
        do
            echo "Updating env variables of $i"
            sed -i '' "s|http://localhost:3000|$VITE_DOMAIN_NAME|g" $i
        done

}


update_docker_compose(){
    read -p "Enter the backoffice domain: " BACKOFFICE_DOMAIN
    check_http_https $BACKOFFICE_DOMAIN
    read -p "Enter the workflow dashboard domain: " WORKFLOW_DASHBOARD_DOMAIN
    check_http_https $WORKFLOW_DASHBOARD_DOMAIN
    read -p "Enter the kyb domain: " KYB_DOMAIN
    check_http_https $KYB_DOMAIN
    echo "Updating docker-compose env variables"
    env_files=$(find ./deploy -name "docker-compose-build.yml")
    for i in $env_files;
        do
            echo "Updating env variables for KYB in $i"
            sed -i '' "s|http://localhost:5201|$KYB_DOMAIN|g" $i

            echo "Updating env variables for Workflow Dashboard in $i"
            sed -i '' "s|http://localhost:5200|$WORKFLOW_DASHBOARD_DOMAIN|g" $i

            echo "Updating env variables for Backoffice in $i"
            sed -i '' "s|http://localhost:5137|$BACKOFFICE_DOMAIN|g" $i
        done
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--domain)
            if [ -n "$2" ]; then
                VITE_DOMAIN_NAME="$2"
                echo "VITE DOMAIN: $VITE_DOMAIN_NAME"
                check_http_https $VITE_DOMAIN_NAME
                update_frontend_build_variables $VITE_DOMAIN_NAME
                update_docker_compose
                shift 2
            else
                echo "Error: --domain requires a domain name."
                exit 1
            fi
            ;;
        -v|--verbose)
            VERBOSE=true
            echo "Verbose mode enabled."
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information."
            exit 1
            ;;
    esac
done

check_os
# ## Bring docker-container up
# cd deploy; sudo docker-compose -f docker-compose-build.yml up -d
